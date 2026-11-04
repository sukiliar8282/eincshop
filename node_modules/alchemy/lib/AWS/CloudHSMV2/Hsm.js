import * as cloudhsm from "@distilled.cloud/aws/cloudhsm-v2";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { findClusterById } from "./internal.js";
/**
 * A hardware security module (HSM) inside an AWS CloudHSM {@link Cluster}.
 *
 * HSMs take roughly 10-20 minutes to provision and are billed hourly while
 * they exist. The cluster must be in the `UNINITIALIZED`, `ACTIVE`, or
 * `DEGRADED` state to accept a new HSM. Destroy HSMs you are not using.
 * ### Creating an HSM
 * **Example:** HSM in a Cluster's Availability Zone
 * ```typescript
 * const hsm = yield* Hsm("Primary", {
 *   clusterId: cluster.clusterId,
 *   availabilityZone: "us-west-2a",
 * });
 * ```
 *
 * **Example:** HSM with a Fixed ENI Address
 * ```typescript
 * const hsm = yield* Hsm("Primary", {
 *   clusterId: cluster.clusterId,
 *   availabilityZone: "us-west-2a",
 *   ipAddress: "10.0.1.20",
 * });
 * ```
 *
 * @resource
 */
export const Hsm = Resource("AWS.CloudHSMV2.Hsm");
export const HsmProvider = () => Provider.effect(Hsm, Effect.gen(function* () {
    // HSMs are enumerated through their cluster — describeClusters embeds
    // each cluster's Hsms.
    const findHsm = Effect.fn(function* (clusterId, hsmId) {
        const cluster = yield* findClusterById(clusterId);
        return cluster?.Hsms?.find((hsm) => hsm.HsmId === hsmId && hsm.State !== "DELETED");
    });
    // Bounded readiness wait. HSM provisioning typically completes in
    // 10-20 minutes; budget ~25 min (100 * 15s).
    const waitForActive = Effect.fn(function* (clusterId, hsmId) {
        const policy = Schedule.max([
            Schedule.fixed("15 seconds"),
            Schedule.recurs(100),
        ]);
        return yield* findHsm(clusterId, hsmId).pipe(Effect.flatMap((hsm) => {
            if (hsm === undefined) {
                return Effect.fail(new Error(`HSM '${hsmId}' not found in cluster '${clusterId}'`));
            }
            if (hsm.State !== "ACTIVE") {
                return Effect.fail(new Error(`HSM '${hsmId}' not active (state: ${hsm.State})`));
            }
            return Effect.succeed(hsm);
        }), Effect.retry({ schedule: policy }));
    });
    // Bounded wait-until-gone after delete initiation (~15 min = 60 * 15s).
    // The whole cluster disappearing counts as gone too.
    const waitUntilGone = Effect.fn(function* (clusterId, hsmId) {
        const policy = Schedule.max([
            Schedule.fixed("15 seconds"),
            Schedule.recurs(60),
        ]);
        yield* findHsm(clusterId, hsmId).pipe(Effect.flatMap((hsm) => hsm === undefined
            ? Effect.void
            : Effect.fail(new Error(`HSM '${hsmId}' still deleting (state: ${hsm.State})`))), Effect.retry({ schedule: policy }));
    });
    const toAttrs = Effect.fn(function* (hsm) {
        if (!hsm.ClusterId) {
            return yield* Effect.fail(new Error(`HSM '${hsm.HsmId}' is missing its ClusterId`));
        }
        return {
            hsmId: hsm.HsmId,
            clusterId: hsm.ClusterId,
            availabilityZone: hsm.AvailabilityZone,
            subnetId: hsm.SubnetId,
            eniId: hsm.EniId,
            eniIp: hsm.EniIp,
            state: hsm.State ?? "ACTIVE",
        };
    });
    return {
        stables: ["hsmId", "clusterId", "availabilityZone"],
        diff: Effect.fn(function* ({ olds, news }) {
            if (!isResolved(news))
                return undefined;
            const n = news ?? { clusterId: "", availabilityZone: "" };
            const o = olds ?? { clusterId: "", availabilityZone: "" };
            // Every HSM property is create-only.
            if (n.clusterId !== o.clusterId) {
                return { action: "replace" };
            }
            if (n.availabilityZone !== o.availabilityZone) {
                return { action: "replace" };
            }
            if (n.ipAddress !== o.ipAddress) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ output }) {
            // HSMs have no name, no tags, and an auto-assigned id — without a
            // cached id there is nothing to correlate on.
            if (output === undefined)
                return undefined;
            const hsm = yield* findHsm(output.clusterId, output.hsmId);
            if (hsm === undefined)
                return undefined;
            return yield* toAttrs(hsm);
        }),
        reconcile: Effect.fn(function* ({ news, output, session }) {
            const props = news;
            // 1. Observe — the cached id is only a hint; the cluster's HSM
            //    list is authoritative.
            let observed = output
                ? yield* findHsm(output.clusterId, output.hsmId)
                : undefined;
            // 2. Ensure — create if missing.
            if (observed === undefined) {
                const created = yield* cloudhsm.createHsm({
                    ClusterId: props.clusterId,
                    AvailabilityZone: props.availabilityZone,
                    IpAddress: props.ipAddress,
                });
                observed = created.Hsm;
            }
            const hsmId = observed?.HsmId;
            if (!hsmId) {
                return yield* Effect.fail(new Error("CreateHsm returned no HsmId"));
            }
            // 3. Wait for the HSM to become ACTIVE (nothing else is mutable).
            const active = yield* waitForActive(props.clusterId, hsmId);
            yield* session.note(hsmId);
            return yield* toAttrs(active);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* cloudhsm
                .deleteHsm({ ClusterId: output.clusterId, HsmId: output.hsmId })
                .pipe(Effect.catchTag("CloudHsmResourceNotFoundException", () => Effect.void));
            // Deletion is asynchronous and the parent cluster cannot be
            // deleted until the HSM is gone — wait it out (bounded).
            yield* waitUntilGone(output.clusterId, output.hsmId);
        }),
        list: () => Effect.gen(function* () {
            const pages = yield* cloudhsm.describeClusters
                .pages({})
                .pipe(Stream.runCollect);
            const hsms = Array.from(pages)
                .flatMap((page) => page.Clusters ?? [])
                .flatMap((cluster) => cluster.Hsms ?? [])
                .filter((hsm) => hsm.State !== "DELETED");
            return yield* Effect.forEach(hsms, (hsm) => toAttrs(hsm));
        }),
    };
}));
//# sourceMappingURL=Hsm.js.map