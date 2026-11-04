import * as sagemaker from "@distilled.cloud/aws/sagemaker";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as EffectStream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags, } from "../../Tags.js";
/**
 * An Amazon SageMaker Endpoint — the live, invocable deployment of an
 * `EndpointConfig`. Provisioning takes minutes and **bills while the
 * endpoint exists** (serverless variants bill per request; instance variants
 * bill per instance-hour). Destroy endpoints promptly.
 *
 * Invoke a deployed endpoint from a function with
 * `AWS.SageMakerRuntime.InvokeEndpoint`.
 * ### Creating Endpoints
 * **Example:** Deploy an EndpointConfig
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const endpoint = yield* AWS.SageMaker.Endpoint("MyEndpoint", {
 *   endpointConfigName: config.endpointConfigName,
 * });
 * ```
 *
 * ### Invoking
 * **Example:** Invoke from a Lambda function
 * ```typescript
 * // init
 * const invoke = yield* AWS.SageMakerRuntime.InvokeEndpoint(
 *   endpoint.endpointName,
 * );
 *
 * // runtime
 * const result = yield* invoke({
 *   ContentType: "application/json",
 *   Body: JSON.stringify({ instances: [[1, 2, 3, 4]] }),
 * });
 * ```
 *
 * @resource
 */
export const Endpoint = Resource("AWS.SageMaker.Endpoint");
const createEndpointName = (id, props) => props.endpointName
    ? Effect.succeed(props.endpointName)
    : createPhysicalName({ id, maxLength: 63 });
const fetchEndpointTags = Effect.fn(function* (arn) {
    const response = yield* sagemaker
        .listTags({ ResourceArn: arn })
        .pipe(Effect.catchTag("AccessDeniedException", () => Effect.succeed(undefined)));
    return Object.fromEntries((response?.Tags ?? []).flatMap((tag) => tag.Key !== undefined ? [[tag.Key, tag.Value ?? ""]] : []));
});
const describeEndpointOrUndefined = (name) => sagemaker
    .describeEndpoint({ EndpointName: name })
    .pipe(Effect.catchTag("EndpointNotFound", () => Effect.succeed(undefined)));
/**
 * The endpoint is still transitioning toward the awaited state — retried by
 * the bounded wait schedule.
 */
class EndpointNotReady extends Data.TaggedError("EndpointNotReady") {
}
/**
 * The endpoint's asynchronous provisioning converged to the terminal
 * `Failed` status (e.g. the container image could not be pulled or the model
 * server failed its health checks).
 */
export class EndpointProvisioningFailed extends Data.TaggedError("EndpointProvisioningFailed") {
}
// Explicitly-typed retry wrapper — an inline `Effect.retry` in provider
// lifecycle code leaks `Retry.Return`'s conditional type into declaration
// emit and widens the provider layer to `unknown` for every consumer of
// `AWS.providers()`.
const retryWhileNotReady = (self) => Effect.retry(self, {
    while: (e) => e._tag === "EndpointNotReady",
    // Endpoint provisioning takes ~3-10 min; poll every 15s up to ~20 min.
    schedule: Schedule.max([
        Schedule.spaced("15 seconds"),
        Schedule.recurs(80),
    ]),
});
const waitForEndpoint = (name, target) => retryWhileNotReady(Effect.gen(function* () {
    const described = yield* describeEndpointOrUndefined(name);
    if (target === "Gone") {
        if (described === undefined)
            return;
        return yield* Effect.fail(new EndpointNotReady({
            endpointName: name,
            status: described.EndpointStatus,
        }));
    }
    if (described?.EndpointStatus === "InService")
        return;
    if (described?.EndpointStatus === "Failed") {
        return yield* Effect.fail(new EndpointProvisioningFailed({
            endpointName: name,
            message: described.FailureReason,
        }));
    }
    return yield* Effect.fail(new EndpointNotReady({
        endpointName: name,
        status: described?.EndpointStatus,
    }));
}));
export const EndpointProvider = () => Provider.effect(Endpoint, Effect.gen(function* () {
    return {
        stables: ["endpointName", "endpointArn"],
        list: () => Effect.gen(function* () {
            const summaries = yield* sagemaker.listEndpoints.pages({}).pipe(EffectStream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => page.Endpoints ?? [])));
            return summaries.flatMap((s) => s.EndpointName !== undefined && s.EndpointArn !== undefined
                ? [
                    {
                        endpointName: s.EndpointName,
                        endpointArn: s.EndpointArn,
                        endpointStatus: s.EndpointStatus,
                    },
                ]
                : []);
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const name = output?.endpointName ?? (yield* createEndpointName(id, olds ?? {}));
            const described = yield* describeEndpointOrUndefined(name);
            if (!described || described.EndpointStatus === "Deleting") {
                return undefined;
            }
            const attrs = {
                endpointName: described.EndpointName,
                endpointArn: described.EndpointArn,
                endpointStatus: described.EndpointStatus,
            };
            const tags = yield* fetchEndpointTags(described.EndpointArn);
            return (yield* hasAlchemyTags(id, tags))
                ? attrs
                : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return;
            if (olds === undefined)
                return;
            const oldName = yield* createEndpointName(id, olds);
            const newName = yield* createEndpointName(id, news);
            if (oldName !== newName) {
                return { action: "replace" };
            }
            // endpointConfigName changes update the live endpoint in place.
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            if (!news) {
                return yield* Effect.fail(new Error("SageMaker Endpoint requires props"));
            }
            const name = output?.endpointName ?? (yield* createEndpointName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            // Observe.
            let described = yield* describeEndpointOrUndefined(name);
            // A terminally-failed endpoint cannot be updated — delete it and
            // fall through to a fresh create so the reconciler converges.
            if (described?.EndpointStatus === "Failed") {
                yield* session.note(`Endpoint ${name} is Failed (${described.FailureReason ?? "unknown"}) — recreating`);
                yield* sagemaker
                    .deleteEndpoint({ EndpointName: name })
                    .pipe(Effect.catchTag("EndpointNotFound", () => Effect.void));
                yield* waitForEndpoint(name, "Gone");
                described = undefined;
            }
            // Ensure — create if missing; tolerate the already-exists race.
            if (described === undefined) {
                yield* sagemaker
                    .createEndpoint({
                    EndpointName: name,
                    EndpointConfigName: news.endpointConfigName,
                    DeploymentConfig: news.deploymentConfig,
                    Tags: Object.entries(desiredTags).map(([Key, Value]) => ({
                        Key,
                        Value,
                    })),
                })
                    .pipe(Effect.catchTag("EndpointAlreadyExists", () => Effect.void));
                yield* session.note(`Creating endpoint ${name}...`);
            }
            else if (described.EndpointConfigName !== news.endpointConfigName &&
                described.EndpointStatus === "InService") {
                // Sync — roll the live endpoint onto the desired configuration.
                yield* sagemaker.updateEndpoint({
                    EndpointName: name,
                    EndpointConfigName: news.endpointConfigName,
                    DeploymentConfig: news.deploymentConfig,
                });
                yield* session.note(`Updating endpoint ${name} to config ${news.endpointConfigName}...`);
            }
            // Converge to InService (also settles Creating/Updating states we
            // observed mid-flight, e.g. after a crashed reconcile).
            yield* waitForEndpoint(name, "InService");
            const final = yield* describeEndpointOrUndefined(name);
            if (final === undefined) {
                return yield* Effect.fail(new Error(`failed to read reconciled endpoint ${name}`));
            }
            // Sync tags — diff against OBSERVED cloud tags.
            const currentTags = yield* fetchEndpointTags(final.EndpointArn);
            const { removed, upsert } = diffTags(currentTags, desiredTags);
            if (removed.length > 0) {
                yield* sagemaker.deleteTags({
                    ResourceArn: final.EndpointArn,
                    TagKeys: removed,
                });
            }
            if (upsert.length > 0) {
                yield* sagemaker.addTags({
                    ResourceArn: final.EndpointArn,
                    Tags: upsert.map(({ Key, Value }) => ({ Key, Value })),
                });
            }
            yield* session.note(final.EndpointArn);
            return {
                endpointName: final.EndpointName,
                endpointArn: final.EndpointArn,
                endpointStatus: final.EndpointStatus,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* sagemaker
                .deleteEndpoint({ EndpointName: output.endpointName })
                .pipe(Effect.catchTag("EndpointNotFound", () => Effect.void));
            yield* waitForEndpoint(output.endpointName, "Gone");
        }),
    };
}));
//# sourceMappingURL=Endpoint.js.map