import * as aoss from "@distilled.cloud/aws/opensearchserverless";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { toWireMinutes } from "../../Util/Duration.js";
import { AWSEnvironment } from "../Environment.js";
import { retryWhileConflict } from "./internal.js";
/**
 * An Amazon OpenSearch Serverless security configuration. Security
 * configurations federate OpenSearch Dashboards sign-in with SAML identity
 * providers, AWS IAM Identity Center, or IAM federation, so human users can
 * access collections without IAM credentials.
 *
 * The configuration's `configId` (format `saml/{accountId}/{name}`) is what a
 * data {@link AccessPolicy} references as a `Principal` to grant the federated
 * identities index- and collection-level permissions.
 *
 * ### SAML Authentication
 * **Example:** Federate Dashboards with a SAML Identity Provider
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const saml = yield* AWS.OpenSearchServerless.SecurityConfig("Saml", {
 *   configName: "my-idp",
 *   type: "saml",
 *   samlOptions: {
 *     metadata: idpMetadataXml,
 *     groupAttribute: "groups",
 *     sessionTimeout: "4 hours",
 *   },
 * });
 * // Reference saml.configId as a Principal in a data access policy
 * ```
 *
 * ### IAM Federation
 * **Example:** Map Session Attributes to Identities
 * ```typescript
 * const federation = yield* AWS.OpenSearchServerless.SecurityConfig("Federation", {
 *   configName: "my-federation",
 *   type: "iamfederation",
 *   iamFederationOptions: {
 *     userAttribute: "user",
 *     groupAttribute: "groups",
 *   },
 * });
 * ```
 *
 * @resource
 */
export const SecurityConfig = Resource("AWS.OpenSearchServerless.SecurityConfig");
export const SecurityConfigProvider = () => Provider.effect(SecurityConfig, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return (props.configName ??
            (yield* createPhysicalName({ id, maxLength: 32, lowercase: true })));
    });
    // A security config's id is deterministic: {type}/{accountId}/{name}.
    const computeConfigId = Effect.fn(function* (type, name) {
        const { accountId } = yield* AWSEnvironment.current;
        return `${type}/${accountId}/${name}`;
    });
    const toName = (configId) => configId.split("/").at(-1);
    const toAttributes = (detail) => ({
        configId: detail.id,
        configName: toName(detail.id),
        type: detail.type,
        configVersion: detail.configVersion,
        description: detail.description,
    });
    const toWireSamlOptions = (saml) => saml === undefined
        ? undefined
        : {
            metadata: saml.metadata,
            userAttribute: saml.userAttribute,
            groupAttribute: saml.groupAttribute,
            openSearchServerlessEntityId: saml.openSearchServerlessEntityId,
            sessionTimeout: toWireMinutes(saml.sessionTimeout),
        };
    const observe = Effect.fn(function* (configId) {
        return yield* aoss.getSecurityConfig({ id: configId }).pipe(Effect.map((r) => r.securityConfigDetail), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    });
    return SecurityConfig.Provider.of({
        stables: ["configId", "configName", "type"],
        list: () => Effect.gen(function* () {
            const types = [
                "saml",
                "iamidentitycenter",
                "iamfederation",
            ];
            const results = [];
            for (const type of types) {
                const pages = yield* aoss.listSecurityConfigs
                    .pages({ type })
                    .pipe(Stream.runCollect);
                for (const page of pages) {
                    for (const s of page.securityConfigSummaries ?? []) {
                        if (s.id !== undefined &&
                            s.type !== undefined &&
                            s.configVersion !== undefined) {
                            results.push({
                                configId: s.id,
                                configName: toName(s.id),
                                type: s.type,
                                configVersion: s.configVersion,
                                description: s.description,
                            });
                        }
                    }
                }
            }
            return results;
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const type = output?.type ?? olds?.type;
            if (type === undefined) {
                return undefined;
            }
            const configId = output?.configId ??
                (yield* computeConfigId(type, yield* createName(id, olds ?? {})));
            const detail = yield* observe(configId);
            if (detail?.id === undefined) {
                return undefined;
            }
            // Security configs carry no tags, so an existing same-name config is
            // adopted.
            return toAttributes(detail);
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            if (olds.type !== news.type) {
                return { action: "replace" };
            }
            const oldName = yield* createName(id, olds);
            const newName = yield* createName(id, news);
            if (oldName !== newName) {
                return { action: "replace" };
            }
            // description/options fall through to the default update path
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const type = news.type;
            const name = output?.configName ?? (yield* createName(id, news));
            const configId = output?.configId ?? (yield* computeConfigId(type, name));
            const desiredSaml = toWireSamlOptions(news.samlOptions);
            // 1. OBSERVE
            let detail = yield* observe(configId);
            // 2. ENSURE — create if missing; tolerate a concurrent create race
            if (detail?.id === undefined) {
                detail = yield* aoss
                    .createSecurityConfig({
                    type,
                    name,
                    description: news.description,
                    samlOptions: desiredSaml,
                    iamIdentityCenterOptions: news.iamIdentityCenterOptions,
                    iamFederationOptions: news.iamFederationOptions,
                })
                    .pipe(Effect.map((r) => r.securityConfigDetail), Effect.catchTag("ConflictException", () => observe(configId)));
            }
            else {
                // 3. SYNC — update when observed drifts from desired
                const samlDrift = desiredSaml !== undefined &&
                    (desiredSaml.metadata !== detail.samlOptions?.metadata ||
                        desiredSaml.userAttribute !==
                            detail.samlOptions?.userAttribute ||
                        desiredSaml.groupAttribute !==
                            detail.samlOptions?.groupAttribute ||
                        (desiredSaml.sessionTimeout !== undefined &&
                            desiredSaml.sessionTimeout !==
                                detail.samlOptions?.sessionTimeout));
                const federationDrift = news.iamFederationOptions !== undefined &&
                    (news.iamFederationOptions.userAttribute !==
                        detail.iamFederationOptions?.userAttribute ||
                        news.iamFederationOptions.groupAttribute !==
                            detail.iamFederationOptions?.groupAttribute);
                const identityCenterDrift = news.iamIdentityCenterOptions !== undefined &&
                    (news.iamIdentityCenterOptions.userAttribute !==
                        detail.iamIdentityCenterOptions?.userAttribute ||
                        news.iamIdentityCenterOptions.groupAttribute !==
                            detail.iamIdentityCenterOptions?.groupAttribute);
                const descriptionDrift = news.description !== undefined &&
                    news.description !== detail.description;
                if (samlDrift ||
                    federationDrift ||
                    identityCenterDrift ||
                    descriptionDrift) {
                    detail = yield* aoss
                        .updateSecurityConfig({
                        id: detail.id,
                        configVersion: detail.configVersion,
                        description: descriptionDrift ? news.description : undefined,
                        samlOptions: samlDrift ? desiredSaml : undefined,
                        iamIdentityCenterOptionsUpdates: identityCenterDrift
                            ? {
                                userAttribute: news.iamIdentityCenterOptions?.userAttribute,
                                groupAttribute: news.iamIdentityCenterOptions?.groupAttribute,
                            }
                            : undefined,
                        iamFederationOptions: federationDrift
                            ? news.iamFederationOptions
                            : undefined,
                    })
                        .pipe(Effect.map((r) => r.securityConfigDetail));
                }
            }
            if (detail?.id === undefined) {
                return yield* Effect.fail(new aoss.ResourceNotFoundException({
                    message: `security config ${configId} not visible after reconcile`,
                }));
            }
            yield* session.note(detail.id);
            return toAttributes(detail);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* retryWhileConflict(aoss.deleteSecurityConfig({ id: output.configId })).pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    });
}));
//# sourceMappingURL=SecurityConfig.js.map