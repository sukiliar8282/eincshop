import * as deadline from "@distilled.cloud/aws/deadline";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as EffectStream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { toWireHours, toWireSeconds } from "../../Util/Duration.js";
import { asPlain, deadlineArnOf, fetchDeadlineTags, retryThroughIamPropagation, retryWhileConflict, retryWhileFarmSettling, syncDeadlineTags, } from "./internal.js";
const toWireAutoScaling = (config) => {
    if (config === undefined)
        return undefined;
    const { workerIdleDuration, ...rest } = config;
    return {
        ...rest,
        workerIdleDurationSeconds: toWireSeconds(workerIdleDuration),
    };
};
const toWirePersistentVolume = (config) => {
    if (config === undefined)
        return undefined;
    const { lastUsedTtl, ...rest } = config;
    return { ...rest, lastUsedTtlHours: toWireHours(lastUsedTtl) };
};
const toWireConfiguration = (config) => config.customerManaged !== undefined
    ? {
        customerManaged: {
            ...config.customerManaged,
            autoScalingConfiguration: toWireAutoScaling(config.customerManaged.autoScalingConfiguration),
        },
    }
    : {
        serviceManagedEc2: {
            ...config.serviceManagedEc2,
            autoScalingConfiguration: toWireAutoScaling(config.serviceManagedEc2.autoScalingConfiguration),
            persistentVolumeConfiguration: toWirePersistentVolume(config.serviceManagedEc2.persistentVolumeConfiguration),
        },
    };
const toWireHostConfiguration = (config) => {
    if (config === undefined)
        return undefined;
    const { scriptTimeout, ...rest } = config;
    return { ...rest, scriptTimeoutSeconds: toWireSeconds(scriptTimeout) };
};
/**
 * An AWS Deadline Cloud fleet — a group of workers (customer-managed hosts
 * or service-managed EC2 instances) that run render jobs from associated
 * queues.
 *
 * ### Creating Fleets
 * **Example:** Customer-Managed Fleet
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const fleet = yield* AWS.Deadline.Fleet("Workers", {
 *   farmId: farm.farmId,
 *   roleArn: fleetRole.roleArn,
 *   maxWorkerCount: 10,
 *   configuration: {
 *     customerManaged: {
 *       mode: "NO_SCALING",
 *       workerCapabilities: {
 *         vCpuCount: { min: 1 },
 *         memoryMiB: { min: 1024 },
 *         osFamily: "LINUX",
 *         cpuArchitectureType: "x86_64",
 *       },
 *     },
 *   },
 * });
 * ```
 *
 * **Example:** Service-Managed EC2 Fleet
 * ```typescript
 * const fleet = yield* AWS.Deadline.Fleet("Workers", {
 *   farmId: farm.farmId,
 *   roleArn: fleetRole.roleArn,
 *   minWorkerCount: 0,
 *   maxWorkerCount: 5,
 *   configuration: {
 *     serviceManagedEc2: {
 *       instanceCapabilities: {
 *         vCpuCount: { min: 2, max: 8 },
 *         memoryMiB: { min: 4096 },
 *         osFamily: "LINUX",
 *         cpuArchitectureType: "x86_64",
 *       },
 *       instanceMarketOptions: { type: "spot" },
 *     },
 *   },
 * });
 * ```
 *
 * @resource
 */
export const Fleet = Resource("AWS.Deadline.Fleet");
const createFleetName = (id, props) => props.displayName
    ? Effect.succeed(props.displayName)
    : createPhysicalName({ id, maxLength: 100 });
const readFleetById = Effect.fn(function* (farmId, fleetId, arnOf) {
    const described = yield* deadline
        .getFleet({ farmId, fleetId })
        .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    if (!described)
        return undefined;
    const fleetArn = arnOf(`farm/${described.farmId}/fleet/${described.fleetId}`);
    const state = {
        described,
        attrs: {
            farmId: described.farmId,
            fleetId: described.fleetId,
            fleetArn,
            displayName: described.displayName,
            status: described.status,
            workerCount: described.workerCount,
            minWorkerCount: described.minWorkerCount,
            maxWorkerCount: described.maxWorkerCount,
            roleArn: described.roleArn,
            tags: yield* fetchDeadlineTags(fleetArn),
        },
    };
    return state;
});
const findFleetByDisplayName = Effect.fn(function* (farmId, displayName, arnOf) {
    const summaries = yield* deadline.listFleets.items({ farmId }).pipe(EffectStream.runCollect, Effect.map((chunk) => Array.from(chunk)), 
    // The parent farm may itself be gone.
    Effect.catchTag("ResourceNotFoundException", () => Effect.succeed([])));
    const match = summaries.find((summary) => summary.displayName === displayName);
    if (!match)
        return undefined;
    return yield* readFleetById(farmId, match.fleetId, arnOf);
});
/**
 * A fleet still transitioning toward the awaited state — retried by the
 * bounded wait schedules below.
 */
class FleetNotReady extends Data.TaggedError("FleetNotReady") {
}
/**
 * A fleet whose asynchronous provisioning converged to a terminal failed
 * status (`CREATE_FAILED` / `UPDATE_FAILED`).
 */
export class FleetProvisioningFailed extends Data.TaggedError("FleetProvisioningFailed") {
}
const retryWhileNotReady = (self) => Effect.retry(self, {
    while: (e) => e._tag === "FleetNotReady",
    // Fleet activation is usually well under a minute; stay within the
    // provider-wide bounded provisioning budget.
    schedule: Schedule.max([Schedule.spaced("6 seconds"), Schedule.recurs(9)]),
});
const waitForFleetActive = (farmId, fleetId, arnOf) => retryWhileNotReady(Effect.gen(function* () {
    const state = yield* readFleetById(farmId, fleetId, arnOf);
    if (state === undefined) {
        return yield* Effect.fail(new FleetNotReady({ fleetId, status: undefined }));
    }
    if (state.described.status === "CREATE_FAILED" ||
        state.described.status === "UPDATE_FAILED") {
        return yield* Effect.fail(new FleetProvisioningFailed({
            fleetId,
            status: state.described.status,
            message: state.described.statusMessage,
        }));
    }
    if (state.described.status !== "ACTIVE" &&
        state.described.status !== "SUSPENDED") {
        return yield* Effect.fail(new FleetNotReady({ fleetId, status: state.described.status }));
    }
    return state;
}));
const waitUntilFleetGone = (farmId, fleetId) => retryWhileNotReady(Effect.gen(function* () {
    const described = yield* deadline
        .getFleet({ farmId, fleetId })
        .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    if (described !== undefined) {
        return yield* Effect.fail(new FleetNotReady({ fleetId, status: described.status }));
    }
})).pipe(
// Exhausted retries: deletion is already converging server-side.
Effect.catchTag("FleetNotReady", () => Effect.void));
export const FleetProvider = () => Provider.effect(Fleet, Effect.gen(function* () {
    return {
        stables: ["farmId", "fleetId", "fleetArn", "roleArn"],
        // Keyed by a parent farm — sub-resource list() convention.
        list: () => Effect.succeed([]),
        read: Effect.fn(function* ({ id, olds, output }) {
            const arnOf = yield* deadlineArnOf;
            const farmId = output?.farmId ?? olds?.farmId;
            if (farmId === undefined)
                return undefined;
            const state = output?.fleetId
                ? yield* readFleetById(farmId, output.fleetId, arnOf)
                : yield* findFleetByDisplayName(farmId, yield* createFleetName(id, olds ?? {}), arnOf);
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
            // The parent farm is fixed at creation.
            if (olds.farmId !== news.farmId) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            if (news === undefined) {
                return yield* Effect.fail(new Error("AWS.Deadline.Fleet requires props"));
            }
            const arnOf = yield* deadlineArnOf;
            const farmId = news.farmId;
            const displayName = yield* createFleetName(id, news);
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            // Observe.
            let state = output?.fleetId
                ? yield* readFleetById(farmId, output.fleetId, arnOf)
                : yield* findFleetByDisplayName(farmId, displayName, arnOf);
            // Ensure — create if missing, then wait for ACTIVE.
            if (state === undefined) {
                const created = yield* retryWhileFarmSettling(retryThroughIamPropagation(deadline.createFleet({
                    farmId,
                    displayName,
                    description: news.description,
                    roleArn: news.roleArn,
                    minWorkerCount: news.minWorkerCount,
                    maxWorkerCount: news.maxWorkerCount,
                    configuration: toWireConfiguration(news.configuration),
                    hostConfiguration: toWireHostConfiguration(news.hostConfiguration),
                    tags: desiredTags,
                })));
                yield* session.note(`Creating fleet ${displayName} (${created.fleetId})...`);
                state = yield* waitForFleetActive(farmId, created.fleetId, arnOf);
            }
            // Sync mutable settings — only when drifted from OBSERVED state.
            const described = state.described;
            const needsUpdate = displayName !== described.displayName ||
                (news.description !== undefined &&
                    news.description !== (asPlain(described.description) ?? "")) ||
                news.roleArn !== described.roleArn ||
                (news.minWorkerCount !== undefined &&
                    news.minWorkerCount !== described.minWorkerCount) ||
                news.maxWorkerCount !== described.maxWorkerCount ||
                news.configuration !== undefined;
            if (needsUpdate) {
                yield* retryWhileConflict(deadline.updateFleet({
                    farmId,
                    fleetId: state.attrs.fleetId,
                    displayName,
                    description: news.description,
                    roleArn: news.roleArn,
                    minWorkerCount: news.minWorkerCount,
                    maxWorkerCount: news.maxWorkerCount,
                    configuration: toWireConfiguration(news.configuration),
                    hostConfiguration: toWireHostConfiguration(news.hostConfiguration),
                }));
                state = yield* waitForFleetActive(farmId, state.attrs.fleetId, arnOf);
                yield* session.note(`Updated fleet ${displayName}`);
            }
            // Sync tags — diff against observed cloud tags.
            yield* syncDeadlineTags(state.attrs.fleetArn, desiredTags);
            yield* session.note(state.attrs.fleetArn);
            const final = yield* readFleetById(farmId, state.attrs.fleetId, arnOf);
            if (!final) {
                return yield* Effect.fail(new Error(`failed to read reconciled fleet ${displayName}`));
            }
            return final.attrs;
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* retryWhileConflict(deadline.deleteFleet({
                farmId: output.farmId,
                fleetId: output.fleetId,
            })).pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
            // Fleet deletion drains workers asynchronously; wait until gone so
            // the parent farm's deletion does not hit a dependency conflict.
            yield* waitUntilFleetGone(output.farmId, output.fleetId);
        }),
    };
}));
//# sourceMappingURL=Fleet.js.map