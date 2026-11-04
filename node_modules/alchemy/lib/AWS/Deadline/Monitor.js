import * as deadline from "@distilled.cloud/aws/deadline";
import * as Effect from "effect/Effect";
import * as EffectStream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { deadlineArnOf, fetchDeadlineTags, retryThroughIamPropagation, syncDeadlineTags, } from "./internal.js";
/**
 * An AWS Deadline Cloud monitor — the hosted web console where artists and
 * administrators view farms, queues, and jobs, authenticated through IAM
 * Identity Center.
 *
 * ### Creating Monitors
 * **Example:** Basic Monitor
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const monitor = yield* AWS.Deadline.Monitor("StudioMonitor", {
 *   subdomain: "studio-renders",
 *   identityCenterInstanceArn: "arn:aws:sso:::instance/ssoins-1234567890abcdef",
 *   roleArn: monitorRole.roleArn,
 * });
 * ```
 *
 * **Example:** Export the Monitor URL
 * ```typescript
 * // The monitor's web console URL is available as an output attribute —
 * // return it from the stack so users know where to sign in.
 * const monitor = yield* AWS.Deadline.Monitor("StudioMonitor", {
 *   subdomain: "studio-renders",
 *   identityCenterInstanceArn: identityCenterArn,
 *   roleArn: monitorRole.roleArn,
 * });
 * return { monitorUrl: monitor.url };
 * ```
 *
 * @resource
 */
export const Monitor = Resource("AWS.Deadline.Monitor");
const createMonitorName = (id, props) => props.displayName
    ? Effect.succeed(props.displayName)
    : createPhysicalName({ id, maxLength: 100 });
const readMonitorById = Effect.fn(function* (monitorId, arnOf) {
    const described = yield* deadline
        .getMonitor({ monitorId })
        .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    if (!described)
        return undefined;
    const monitorArn = arnOf(`monitor/${described.monitorId}`);
    const state = {
        described,
        attrs: {
            monitorId: described.monitorId,
            monitorArn,
            displayName: described.displayName,
            subdomain: described.subdomain,
            url: described.url,
            roleArn: described.roleArn,
            identityCenterInstanceArn: described.identityCenterInstanceArn,
            identityCenterApplicationArn: described.identityCenterApplicationArn,
            tags: yield* fetchDeadlineTags(monitorArn),
        },
    };
    return state;
});
const findMonitorBySubdomain = Effect.fn(function* (subdomain, arnOf) {
    const summaries = yield* deadline.listMonitors.items({}).pipe(EffectStream.runCollect, Effect.map((chunk) => Array.from(chunk)));
    const match = summaries.find((summary) => summary.subdomain === subdomain);
    if (!match)
        return undefined;
    return yield* readMonitorById(match.monitorId, arnOf);
});
export const MonitorProvider = () => Provider.effect(Monitor, Effect.gen(function* () {
    return {
        stables: [
            "monitorId",
            "monitorArn",
            "identityCenterInstanceArn",
            "identityCenterApplicationArn",
        ],
        list: () => Effect.gen(function* () {
            const arnOf = yield* deadlineArnOf;
            const summaries = yield* deadline.listMonitors.items({}).pipe(EffectStream.runCollect, Effect.map((chunk) => Array.from(chunk)));
            const states = yield* Effect.forEach(summaries, (summary) => readMonitorById(summary.monitorId, arnOf), { concurrency: 4 });
            return states
                .filter((state) => state !== undefined)
                .map((state) => state.attrs);
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const arnOf = yield* deadlineArnOf;
            const subdomain = output?.subdomain ?? olds?.subdomain;
            const state = output?.monitorId
                ? yield* readMonitorById(output.monitorId, arnOf)
                : subdomain !== undefined
                    ? yield* findMonitorBySubdomain(subdomain, arnOf)
                    : undefined;
            if (!state)
                return undefined;
            return (yield* hasAlchemyTags(id, state.attrs.tags))
                ? state.attrs
                : Unowned(state.attrs);
        }),
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return;
            if (olds === undefined)
                return;
            // The Identity Center instance is fixed at creation.
            if (olds.identityCenterInstanceArn !== news.identityCenterInstanceArn) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            if (news === undefined) {
                return yield* Effect.fail(new Error("AWS.Deadline.Monitor requires props"));
            }
            const arnOf = yield* deadlineArnOf;
            const displayName = yield* createMonitorName(id, news);
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            // Observe.
            let state = output?.monitorId
                ? yield* readMonitorById(output.monitorId, arnOf)
                : yield* findMonitorBySubdomain(news.subdomain, arnOf);
            // Ensure.
            if (state === undefined) {
                const created = yield* retryThroughIamPropagation(deadline.createMonitor({
                    displayName,
                    subdomain: news.subdomain,
                    identityCenterInstanceArn: news.identityCenterInstanceArn,
                    identityCenterRegion: news.identityCenterRegion,
                    roleArn: news.roleArn,
                    tags: desiredTags,
                }));
                yield* session.note(`Created monitor ${displayName} (${created.monitorId})`);
                state = yield* readMonitorById(created.monitorId, arnOf);
                if (state === undefined) {
                    return yield* Effect.fail(new Error(`failed to read created monitor ${displayName}`));
                }
            }
            // Sync mutable settings — only when drifted from OBSERVED state.
            const described = state.described;
            const needsUpdate = displayName !== described.displayName ||
                news.subdomain !== described.subdomain ||
                news.roleArn !== described.roleArn;
            if (needsUpdate) {
                yield* deadline.updateMonitor({
                    monitorId: state.attrs.monitorId,
                    displayName,
                    subdomain: news.subdomain,
                    roleArn: news.roleArn,
                });
                yield* session.note(`Updated monitor ${displayName}`);
            }
            // Sync tags — diff against observed cloud tags.
            yield* syncDeadlineTags(state.attrs.monitorArn, desiredTags);
            yield* session.note(state.attrs.monitorArn);
            const final = yield* readMonitorById(state.attrs.monitorId, arnOf);
            if (!final) {
                return yield* Effect.fail(new Error(`failed to read reconciled monitor ${displayName}`));
            }
            return final.attrs;
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* deadline
                .deleteMonitor({ monitorId: output.monitorId })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    };
}));
//# sourceMappingURL=Monitor.js.map