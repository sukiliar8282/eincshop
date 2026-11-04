import * as cloudformation from "@distilled.cloud/aws/cloudformation";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import { toWireMinutes } from "../../Util/Duration.js";
/**
 * Bounded wait for a stack to leave an in-progress status. Explicitly-typed
 * pipeable helper — an inline `Effect.retry` in a provider lifecycle op leaks
 * `Retry.Return`'s conditional into declaration emit and widens the provider
 * layer to `unknown` R for every `AWS.providers()` consumer.
 */
const retryUntilStackSettled = (self) => Effect.retry(self, {
    while: (e) => e._tag === "StackNotSettled",
    schedule: Schedule.max([Schedule.fixed("5 seconds"), Schedule.recurs(120)]),
});
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
/**
 * An AWS CloudFormation stack — deploy an existing CloudFormation template
 * from Alchemy as an interop/escape hatch.
 *
 * Create and update are asynchronous: the provider submits the template and
 * then polls (bounded) until the stack reaches a terminal state, surfacing a
 * `CREATE_FAILED` / `ROLLBACK_COMPLETE` / `UPDATE_ROLLBACK_COMPLETE` status as
 * a typed error rather than hanging. An update whose template and parameters
 * are unchanged is a no-op (`No updates are to be performed`). Deletion waits
 * for `DELETE_COMPLETE`.
 * ### Deploying a Template
 * **Example:** Inline Template (SNS Topic)
 * ```typescript
 * const stack = yield* CloudFormation.Stack("Notifications", {
 *   templateBody: JSON.stringify({
 *     Resources: {
 *       Topic: { Type: "AWS::SNS::Topic", Properties: { DisplayName: "alerts" } },
 *     },
 *     Outputs: { TopicArn: { Value: { Ref: "Topic" } } },
 *   }),
 * });
 * // stack.outputs.TopicArn -> "arn:aws:sns:us-west-2:...:Notifications-Topic-..."
 * ```
 *
 * **Example:** Template with Parameters
 * ```typescript
 * const stack = yield* CloudFormation.Stack("Config", {
 *   templateBody: JSON.stringify({
 *     Parameters: { Value: { Type: "String" } },
 *     Resources: {
 *       Param: {
 *         Type: "AWS::SSM::Parameter",
 *         Properties: { Type: "String", Value: { Ref: "Value" } },
 *       },
 *     },
 *   }),
 *   parameters: { Value: "hello" },
 * });
 * ```
 *
 * ### IAM Templates
 * **Example:** Acknowledging Capabilities
 * ```typescript
 * const stack = yield* CloudFormation.Stack("Roles", {
 *   templateBody: iamTemplateJson,
 *   capabilities: ["CAPABILITY_NAMED_IAM"],
 * });
 * ```
 *
 * @resource
 */
export const Stack = Resource("AWS.CloudFormation.Stack");
class StackNotSettled extends Data.TaggedError("StackNotSettled") {
}
class StackOperationFailed extends Data.TaggedError("StackOperationFailed") {
}
/** A stack in one of these statuses is mid-operation. */
const isInProgress = (status) => status?.endsWith("_IN_PROGRESS") ?? false;
/**
 * A ROLLBACK_COMPLETE / ROLLBACK_FAILED create leaves the stack in a
 * non-updatable "created but failed" state — it can only be deleted.
 */
const isFailedCreateRemnant = (status) => status === "ROLLBACK_COMPLETE" || status === "ROLLBACK_FAILED";
const isFailure = (status) => (status?.endsWith("_FAILED") ?? false) ||
    status === "ROLLBACK_COMPLETE" ||
    status === "UPDATE_ROLLBACK_COMPLETE";
const toParameters = (parameters) => parameters === undefined
    ? undefined
    : Object.entries(parameters).map(([ParameterKey, ParameterValue]) => ({
        ParameterKey,
        ParameterValue,
    }));
const toWireTags = (tags) => Object.entries(tags).map(([Key, Value]) => ({ Key, Value }));
const toTagRecord = (tags) => Object.fromEntries((tags ?? [])
    .filter((tag) => typeof tag.Key === "string" && typeof tag.Value === "string")
    .map((tag) => [tag.Key, tag.Value]));
const toOutputs = (outputs) => Object.fromEntries((outputs ?? []).flatMap((o) => o.OutputKey !== undefined && o.OutputValue !== undefined
    ? [[o.OutputKey, o.OutputValue]]
    : []));
export const StackProvider = () => Provider.effect(Stack, Effect.gen(function* () {
    const toName = (id, props) => props.stackName
        ? Effect.succeed(props.stackName)
        : createPhysicalName({ id, maxLength: 128 });
    /**
     * Describe a stack by name or id. A missing stack (typed
     * `StackNotFound`) or a fully-deleted stack reads as absent.
     */
    const describe = Effect.fn(function* (nameOrId) {
        const response = yield* cloudformation
            .describeStacks({ StackName: nameOrId })
            .pipe(Effect.map((r) => r.Stacks ?? []), Effect.catchTag("StackNotFound", () => Effect.succeed([])));
        const stack = response[0];
        return stack === undefined || stack.StackStatus === "DELETE_COMPLETE"
            ? undefined
            : stack;
    });
    // Create/update run asynchronously; CloudFormation reports *_IN_PROGRESS
    // while converging. A small stack settles in ~1-2 minutes; budget
    // ~10 min (120 * 5s).
    const waitForSettled = Effect.fn(function* (stackId, stackName) {
        const stack = yield* describe(stackId).pipe(Effect.flatMap((s) => s !== undefined && isInProgress(s.StackStatus)
            ? Effect.fail(new StackNotSettled({
                stackId,
                status: s.StackStatus ?? "UNKNOWN",
            }))
            : Effect.succeed(s)), retryUntilStackSettled);
        if (stack !== undefined && isFailure(stack.StackStatus)) {
            return yield* Effect.fail(new StackOperationFailed({
                stackName,
                status: stack.StackStatus ?? "UNKNOWN",
                reason: stack.StackStatusReason,
            }));
        }
        return stack;
    });
    // Deletion is asynchronous too — wait until the stack reports
    // DELETE_COMPLETE (or vanishes) so dependencies can be torn down after.
    const waitUntilGone = Effect.fn(function* (stackId, stackName) {
        yield* retryUntilStackSettled(describe(stackId).pipe(Effect.flatMap((s) => {
            if (s === undefined)
                return Effect.void;
            if (s.StackStatus === "DELETE_FAILED") {
                return Effect.fail(new StackOperationFailed({
                    stackName,
                    status: "DELETE_FAILED",
                    reason: s.StackStatusReason,
                }));
            }
            return Effect.fail(new StackNotSettled({
                stackId,
                status: s.StackStatus ?? "UNKNOWN",
            }));
        })));
    });
    const toAttrs = (stack) => ({
        stackName: stack.StackName,
        stackId: stack.StackId,
        stackStatus: stack.StackStatus,
        outputs: toOutputs(stack.Outputs),
    });
    return {
        stables: ["stackName", "stackId"],
        diff: Effect.fn(function* ({ id, olds, news }) {
            if (!isResolved(news))
                return undefined;
            if ((yield* toName(id, olds ?? {})) !== (yield* toName(id, news ?? {}))) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const stack = yield* describe(output?.stackId ?? (yield* toName(id, olds ?? {})));
            if (stack === undefined)
                return undefined;
            const attrs = toAttrs(stack);
            const tags = toTagRecord(stack.Tags);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const name = output?.stackName ?? (yield* toName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            // 1. Observe — cloud state is authoritative; output is only an id
            // cache.
            let observed = yield* describe(output?.stackId ?? name);
            // A stack left in ROLLBACK_COMPLETE/ROLLBACK_FAILED by a failed
            // create can only be deleted; clear it before recreating.
            if (observed !== undefined &&
                isFailedCreateRemnant(observed.StackStatus)) {
                yield* cloudformation.deleteStack({ StackName: observed.StackId });
                yield* waitUntilGone(observed.StackId, name);
                observed = undefined;
            }
            // 2. Ensure — create if missing, then wait for CREATE_COMPLETE.
            if (observed === undefined) {
                const created = yield* cloudformation.createStack({
                    StackName: name,
                    TemplateBody: news.templateBody,
                    TemplateURL: news.templateURL,
                    Parameters: toParameters(news.parameters),
                    Capabilities: news.capabilities,
                    RoleARN: news.roleArn,
                    NotificationARNs: news.notificationARNs,
                    DisableRollback: news.disableRollback,
                    OnFailure: news.onFailure,
                    TimeoutInMinutes: toWireMinutes(news.timeout),
                    Tags: toWireTags(desiredTags),
                });
                const settled = yield* waitForSettled(created.StackId, name);
                if (settled === undefined) {
                    return yield* Effect.fail(new StackOperationFailed({
                        stackName: name,
                        status: "DELETE_COMPLETE",
                        reason: "Stack disappeared immediately after creation",
                    }));
                }
                yield* session.note(name);
                return toAttrs(settled);
            }
            // 3. Sync — submit the desired template/params/tags. An unchanged
            // template is a no-op (typed NoUpdateToPerform); skip the wait.
            const didUpdate = yield* cloudformation
                .updateStack({
                StackName: observed.StackId,
                TemplateBody: news.templateBody,
                TemplateURL: news.templateURL,
                Parameters: toParameters(news.parameters),
                Capabilities: news.capabilities,
                RoleARN: news.roleArn,
                NotificationARNs: news.notificationARNs,
                DisableRollback: news.disableRollback,
                Tags: toWireTags(desiredTags),
            })
                .pipe(Effect.as(true), Effect.catchTag("NoUpdateToPerform", () => Effect.succeed(false)));
            const final = didUpdate
                ? yield* waitForSettled(observed.StackId, name)
                : observed;
            if (final === undefined) {
                return yield* Effect.fail(new StackOperationFailed({
                    stackName: name,
                    status: "DELETE_COMPLETE",
                    reason: "Stack disappeared while updating",
                }));
            }
            // 4. Return fresh attributes.
            yield* session.note(name);
            return toAttrs(final);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* cloudformation.deleteStack({ StackName: output.stackId });
            yield* waitUntilGone(output.stackId, output.stackName);
        }),
        list: () => cloudformation.describeStacks.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)
            .flatMap((page) => page.Stacks ?? [])
            .flatMap((s) => s.StackName !== undefined &&
            s.StackId !== undefined &&
            s.StackStatus !== undefined &&
            s.StackStatus !== "DELETE_COMPLETE"
            ? [
                {
                    stackName: s.StackName,
                    stackId: s.StackId,
                    stackStatus: s.StackStatus,
                    outputs: toOutputs(s.Outputs),
                },
            ]
            : [])), Effect.catchTag("StackNotFound", () => Effect.succeed([]))),
    };
}));
//# sourceMappingURL=Stack.js.map