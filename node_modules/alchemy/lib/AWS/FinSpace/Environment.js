import * as finspace from "@distilled.cloud/aws/finspace";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags, } from "../../Tags.js";
/**
 * An Amazon FinSpace environment — a managed data management and analytics
 * workspace for the financial services industry.
 *
 * :::caution
 * FinSpace is closed to new customers and environment provisioning takes
 * ~20 minutes and bills while it exists. Live lifecycle tests are gated
 * behind `AWS_TEST_FINSPACE=1`.
 * :::
 * ### Creating Environments
 * **Example:** Basic Environment
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const env = yield* AWS.FinSpace.Environment("Analytics", {
 *   description: "research analytics environment",
 * });
 * ```
 *
 * **Example:** Federated Environment
 * ```typescript
 * const env = yield* AWS.FinSpace.Environment("Analytics", {
 *   federationMode: "FEDERATED",
 *   federationParameters: {
 *     samlMetadataURL: "https://idp.example.com/metadata.xml",
 *     federationProviderName: "idp.example.com",
 *     applicationCallBackURL: "https://example.com/callback",
 *   },
 * });
 * ```
 *
 * @resource
 */
export const Environment = Resource("AWS.FinSpace.Environment");
const createEnvironmentName = (id, props) => props.name
    ? Effect.succeed(props.name)
    : createPhysicalName({ id, maxLength: 255 });
const fetchTags = Effect.fn(function* (arn) {
    const response = yield* finspace
        .listTagsForResource({ resourceArn: arn })
        .pipe(Effect.catchTag(["ResourceNotFoundException", "InvalidRequestException"], () => Effect.succeed(undefined)));
    return Object.fromEntries(Object.entries(response?.tags ?? {}).flatMap(([key, value]) => value === undefined ? [] : [[key, value]]));
});
const toAttributes = Effect.fn(function* (env, fallbackId) {
    const environmentId = env.environmentId ?? fallbackId;
    const environmentArn = env.environmentArn ?? "";
    const attrs = {
        environmentId,
        environmentArn,
        name: env.name ?? "",
        status: env.status,
        environmentUrl: env.environmentUrl,
        sageMakerStudioDomainUrl: env.sageMakerStudioDomainUrl,
        kmsKeyId: env.kmsKeyId,
        dedicatedServiceAccountId: env.dedicatedServiceAccountId,
        tags: environmentArn ? yield* fetchTags(environmentArn) : {},
    };
    return attrs;
});
const isGone = (status) => status === "DELETED" ||
    status === "DELETING" ||
    status === "DELETE_REQUESTED";
const readEnvironmentById = Effect.fn(function* (environmentId) {
    const response = yield* finspace
        .getEnvironment({ environmentId })
        .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    const env = response?.environment;
    if (!env || isGone(env.status))
        return undefined;
    return env;
});
// listEnvironments is not marked paginated in the Smithy model — paginate by
// hand, page-bounded, treating an absent/empty nextToken as terminal.
const listAllEnvironments = Effect.gen(function* () {
    const environments = [];
    let nextToken;
    for (let page = 0; page < 20; page++) {
        const response = yield* finspace.listEnvironments({ nextToken });
        environments.push(...(response.environments ?? []));
        if (!response.nextToken)
            break;
        nextToken = response.nextToken;
    }
    return environments;
});
const findEnvironmentByName = Effect.fn(function* (name) {
    const environments = yield* listAllEnvironments;
    return environments.find((env) => env.name === name && !isGone(env.status));
});
/**
 * An environment still transitioning toward the awaited status — retried by
 * the bounded schedule in {@link waitForEnvironmentStatus}.
 */
class EnvironmentNotReady extends Data.TaggedError("EnvironmentNotReady") {
}
/**
 * An environment whose asynchronous provisioning converged to the terminal
 * `FAILED_CREATION` status.
 */
export class EnvironmentProvisioningFailed extends Data.TaggedError("EnvironmentProvisioningFailed") {
}
// Explicitly-typed retry wrapper — an inline `Effect.retry` in provider
// lifecycle code leaks `Retry.Return`'s conditional type into declaration
// emit and widens the provider layer to `unknown` for every consumer of
// `AWS.providers()`.
const retryWhileNotReady = (self) => Effect.retry(self, {
    while: (e) => e._tag === "EnvironmentNotReady",
    // Environment provisioning is slow (~20 min); poll every 20s up to ~40 min.
    schedule: Schedule.max([
        Schedule.spaced("20 seconds"),
        Schedule.recurs(120),
    ]),
});
const waitForEnvironmentStatus = (environmentId, target) => retryWhileNotReady(Effect.gen(function* () {
    const response = yield* finspace
        .getEnvironment({ environmentId })
        .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    const status = response?.environment?.status;
    if (target === "DELETED") {
        if (response === undefined || isGone(status))
            return;
        return yield* Effect.fail(new EnvironmentNotReady({ environmentId, status }));
    }
    if (status === "CREATED")
        return;
    if (status === "FAILED_CREATION" || status === "SUSPENDED") {
        return yield* Effect.fail(new EnvironmentProvisioningFailed({ environmentId, status }));
    }
    return yield* Effect.fail(new EnvironmentNotReady({ environmentId, status }));
}));
export const EnvironmentProvider = () => Provider.effect(Environment, Effect.gen(function* () {
    return {
        stables: ["environmentId", "environmentArn"],
        list: () => Effect.gen(function* () {
            const environments = yield* listAllEnvironments;
            const hydrated = yield* Effect.forEach(environments.filter((env) => !isGone(env.status)), (env) => toAttributes(env, env.environmentId ?? ""), { concurrency: 5 });
            return hydrated;
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const env = output?.environmentId
                ? yield* readEnvironmentById(output.environmentId)
                : yield* findEnvironmentByName(yield* createEnvironmentName(id, olds ?? {}));
            if (!env)
                return undefined;
            const attrs = yield* toAttributes(env, output?.environmentId ?? "");
            return (yield* hasAlchemyTags(id, attrs.tags))
                ? attrs
                : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return;
            if (olds === undefined)
                return;
            // KMS key, superuser and data bundles are fixed at creation.
            if (olds.kmsKeyId !== news.kmsKeyId ||
                JSON.stringify(olds.superuserParameters) !==
                    JSON.stringify(news.superuserParameters) ||
                JSON.stringify(olds.dataBundles) !==
                    JSON.stringify(news.dataBundles)) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const props = news ?? {};
            const name = yield* createEnvironmentName(id, props);
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...props.tags };
            // Observe — prefer the cached id; fall back to a name lookup so a
            // create whose state failed to persist is adopted, not duplicated.
            let env = output?.environmentId
                ? yield* readEnvironmentById(output.environmentId)
                : yield* findEnvironmentByName(name);
            // Ensure — create if missing, then wait for CREATED.
            if (env === undefined) {
                const created = yield* finspace.createEnvironment({
                    name,
                    description: props.description,
                    kmsKeyId: props.kmsKeyId,
                    federationMode: props.federationMode,
                    federationParameters: props.federationParameters,
                    superuserParameters: props.superuserParameters,
                    dataBundles: props.dataBundles,
                    tags: desiredTags,
                });
                if (!created.environmentId) {
                    return yield* Effect.fail(new Error(`CreateEnvironment for '${name}' returned no id`));
                }
                yield* session.note(`Creating FinSpace environment ${name} (${created.environmentId})...`);
                yield* waitForEnvironmentStatus(created.environmentId, "CREATED");
                env = yield* readEnvironmentById(created.environmentId);
                if (env === undefined) {
                    return yield* Effect.fail(new Error(`failed to read created environment ${name}`));
                }
            }
            const environmentId = env.environmentId;
            if (environmentId === undefined) {
                return yield* Effect.fail(new Error(`environment '${name}' has no environmentId`));
            }
            // Sync mutable settings — only call UpdateEnvironment on drift.
            const needsUpdate = name !== env.name ||
                (props.description !== undefined &&
                    props.description !== env.description) ||
                (props.federationMode !== undefined &&
                    props.federationMode !== env.federationMode);
            if (needsUpdate) {
                yield* finspace.updateEnvironment({
                    environmentId,
                    name,
                    description: props.description,
                    federationMode: props.federationMode,
                    federationParameters: props.federationParameters,
                });
                yield* session.note(`Updated FinSpace environment ${name}`);
            }
            // Sync tags — diff against observed cloud tags.
            const attrs = yield* toAttributes(env, environmentId);
            if (attrs.environmentArn) {
                const { removed, upsert } = diffTags(attrs.tags, desiredTags);
                if (removed.length > 0) {
                    yield* finspace.untagResource({
                        resourceArn: attrs.environmentArn,
                        tagKeys: removed,
                    });
                }
                if (upsert.length > 0) {
                    yield* finspace.tagResource({
                        resourceArn: attrs.environmentArn,
                        tags: Object.fromEntries(upsert.map(({ Key, Value }) => [Key, Value])),
                    });
                }
            }
            yield* session.note(attrs.environmentArn);
            const final = yield* readEnvironmentById(environmentId);
            if (!final) {
                return yield* Effect.fail(new Error(`failed to read reconciled environment ${name}`));
            }
            return yield* toAttributes(final, environmentId);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* finspace
                .deleteEnvironment({ environmentId: output.environmentId })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
            // Deletion is irreversible once initiated; wait until the service
            // reports it gone (DELETE_REQUESTED/DELETING/DELETED or NotFound).
            yield* waitForEnvironmentStatus(output.environmentId, "DELETED");
        }),
    };
}));
//# sourceMappingURL=Environment.js.map