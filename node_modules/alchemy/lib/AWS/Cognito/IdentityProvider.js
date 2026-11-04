import * as cip from "@distilled.cloud/aws/cognito-identity-provider";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
/**
 * A third-party identity provider (SAML, OIDC, or social) attached to an
 * Amazon Cognito user pool, enabling federated sign-in through managed
 * login.
 * ### Creating Identity Providers
 * **Example:** OIDC Provider
 * ```typescript
 * import * as Cognito from "alchemy/AWS/Cognito";
 *
 * const pool = yield* Cognito.UserPool("Users", {});
 * const oidc = yield* Cognito.IdentityProvider("Corporate", {
 *   userPoolId: pool.userPoolId,
 *   providerType: "OIDC",
 *   providerDetails: {
 *     client_id: "my-client-id",
 *     client_secret: Redacted.make("my-client-secret"),
 *     authorize_scopes: "openid email",
 *     oidc_issuer: "https://accounts.google.com",
 *     attributes_request_method: "GET",
 *   },
 *   attributeMapping: { email: "email", username: "sub" },
 * });
 * ```
 *
 * **Example:** Wire the IdP to an App Client
 * ```typescript
 * const client = yield* Cognito.UserPoolClient("Web", {
 *   userPoolId: pool.userPoolId,
 *   supportedIdentityProviders: ["COGNITO", oidc.providerName],
 * });
 * ```
 *
 * @resource
 */
export const IdentityProvider = Resource("AWS.Cognito.IdentityProvider");
/** Unwrap any `Redacted` values (e.g. `client_secret`) into the plain
 * string record the Cognito wire API expects. */
const plainDetails = (details) => Object.fromEntries(Object.entries(details).map(([key, value]) => [
    key,
    typeof value === "string" ? value : Redacted.value(value),
]));
const definedRecord = (record) => Object.fromEntries(Object.entries(record ?? {}).filter((entry) => entry[1] !== undefined));
const canonicalRecord = (record) => JSON.stringify(Object.fromEntries(Object.entries(record).sort(([a], [b]) => a.localeCompare(b))));
export const IdentityProviderProvider = () => Provider.effect(IdentityProvider, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        if (props.providerName)
            return props.providerName;
        // social providers require the name to equal the type
        if (props.providerType !== undefined &&
            props.providerType !== "SAML" &&
            props.providerType !== "OIDC") {
            return props.providerType;
        }
        return yield* createPhysicalName({ id, maxLength: 32 });
    });
    const describeProvider = Effect.fn(function* (userPoolId, providerName) {
        return yield* cip
            .describeIdentityProvider({
            UserPoolId: userPoolId,
            ProviderName: providerName,
        })
            .pipe(Effect.map((r) => r.IdentityProvider), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    });
    const attributesOf = (provider, providerName, userPoolId) => ({
        providerName,
        userPoolId,
        providerType: (provider.ProviderType ?? "OIDC"),
    });
    return IdentityProvider.Provider.of({
        stables: ["providerName", "userPoolId", "providerType"],
        // Sub-resource keyed entirely by its user pool (userPoolId) with no global
        // enumeration API of its own — nuke reaches it through the parent's
        // deletion, so enumeration returns empty per the ProviderService
        // doctrine.
        list: () => Effect.succeed([]),
        read: Effect.fn(function* ({ id, olds, output }) {
            const userPoolId = output?.userPoolId ?? olds?.userPoolId;
            if (userPoolId === undefined)
                return undefined;
            const providerName = output?.providerName ??
                (yield* createName(id, olds ?? { providerType: "OIDC", providerDetails: {} }));
            const observed = yield* describeProvider(userPoolId, providerName);
            return observed === undefined
                ? undefined
                : attributesOf(observed, providerName, userPoolId);
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            const oldName = olds === undefined ? undefined : yield* createName(id, olds);
            const newName = news === undefined ? undefined : yield* createName(id, news);
            if (oldName !== newName ||
                olds?.providerType !== news?.providerType ||
                olds?.userPoolId !== news?.userPoolId) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const providerName = output?.providerName ?? (yield* createName(id, news));
            const userPoolId = news.userPoolId;
            const desiredDetails = plainDetails(news.providerDetails);
            // 1. OBSERVE
            let observed = yield* describeProvider(userPoolId, providerName);
            // 2. ENSURE — tolerate the create race.
            if (observed === undefined) {
                observed = yield* cip
                    .createIdentityProvider({
                    UserPoolId: userPoolId,
                    ProviderName: providerName,
                    ProviderType: news.providerType,
                    ProviderDetails: desiredDetails,
                    AttributeMapping: news.attributeMapping,
                    IdpIdentifiers: news.idpIdentifiers,
                })
                    .pipe(Effect.map((r) => r.IdentityProvider), Effect.catchTag("DuplicateProviderException", () => describeProvider(userPoolId, providerName).pipe(Effect.map((provider) => provider))));
            }
            else {
                // 3. SYNC — details, mapping, and identifiers are mutable.
                // Cognito augments ProviderDetails with derived keys (e.g.
                // attributes_url), so compare desired keys only.
                const observedDetails = definedRecord(observed.ProviderDetails);
                const detailsDrift = Object.entries(desiredDetails).some(([key, value]) => observedDetails[key] !== value);
                const mappingDrift = news.attributeMapping !== undefined &&
                    canonicalRecord(definedRecord(observed.AttributeMapping)) !==
                        canonicalRecord(news.attributeMapping);
                const identifiersDrift = news.idpIdentifiers !== undefined &&
                    [...news.idpIdentifiers].sort().join(",") !==
                        [...(observed.IdpIdentifiers ?? [])].sort().join(",");
                if (detailsDrift || mappingDrift || identifiersDrift) {
                    observed = yield* cip
                        .updateIdentityProvider({
                        UserPoolId: userPoolId,
                        ProviderName: providerName,
                        ProviderDetails: desiredDetails,
                        AttributeMapping: news.attributeMapping,
                        IdpIdentifiers: news.idpIdentifiers,
                    })
                        .pipe(Effect.map((r) => r.IdentityProvider));
                }
            }
            yield* session.note(providerName);
            return attributesOf(observed, providerName, userPoolId);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* cip
                .deleteIdentityProvider({
                UserPoolId: output.userPoolId,
                ProviderName: output.providerName,
            })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    });
}));
//# sourceMappingURL=IdentityProvider.js.map