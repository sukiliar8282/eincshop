import * as ga from "@distilled.cloud/aws/global-accelerator";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { toWireSeconds } from "../../Util/Duration.js";
import { retryGaDeletion, withGaRegion } from "./common.js";
/**
 * A Global Accelerator endpoint group — the set of regional endpoints
 * (ALBs, NLBs, EC2 instances, or Elastic IPs) that a listener routes
 * traffic to in one AWS Region, with traffic-dial and health-check
 * configuration.
 *
 * One endpoint group per region per listener. Everything except the
 * listener and region is updatable in place.
 * ### Creating Endpoint Groups
 * **Example:** Route to an Application Load Balancer
 * ```typescript
 * const group = yield* GlobalAccelerator.EndpointGroup("UsWest2", {
 *   listenerArn: listener.listenerArn,
 *   endpointGroupRegion: "us-west-2",
 *   endpoints: [{ endpointId: alb.loadBalancerArn }],
 * });
 * ```
 *
 * **Example:** Weighted Endpoints with HTTP Health Checks
 * ```typescript
 * const group = yield* GlobalAccelerator.EndpointGroup("UsEast1", {
 *   listenerArn: listener.listenerArn,
 *   endpointGroupRegion: "us-east-1",
 *   endpoints: [
 *     { endpointId: blueAlb.loadBalancerArn, weight: 200 },
 *     { endpointId: greenAlb.loadBalancerArn, weight: 55 },
 *   ],
 *   healthCheckProtocol: "HTTP",
 *   healthCheckPath: "/health",
 *   healthCheckInterval: "10 seconds",
 * });
 * ```
 *
 * ### Traffic Management
 * **Example:** Canary a Region with the Traffic Dial
 * ```typescript
 * const group = yield* GlobalAccelerator.EndpointGroup("Canary", {
 *   listenerArn: listener.listenerArn,
 *   endpointGroupRegion: "eu-west-1",
 *   trafficDialPercentage: 10,
 * });
 * ```
 *
 * @resource
 */
export const EndpointGroup = Resource("AWS.GlobalAccelerator.EndpointGroup");
// Endpoint-group ARNs embed the parent listener ARN:
// arn:...:accelerator/{id}/listener/{id}/endpoint-group/{id}
const listenerArnOf = (endpointGroupArn) => endpointGroupArn.split("/endpoint-group/")[0];
const toAttributes = (g, endpointGroupArn) => ({
    endpointGroupArn,
    listenerArn: listenerArnOf(endpointGroupArn),
    endpointGroupRegion: g.EndpointGroupRegion ?? "",
    trafficDialPercentage: g.TrafficDialPercentage ?? 100,
    healthCheckProtocol: g.HealthCheckProtocol ?? "TCP",
    healthCheckPort: g.HealthCheckPort,
    healthCheckPath: g.HealthCheckPath,
    healthCheckInterval: g.HealthCheckIntervalSeconds ?? 30,
    thresholdCount: g.ThresholdCount ?? 3,
    endpoints: (g.EndpointDescriptions ?? []).map((d) => ({
        endpointId: d.EndpointId,
        weight: d.Weight,
        healthState: d.HealthState,
        clientIPPreservationEnabled: d.ClientIPPreservationEnabled,
    })),
});
// The desired mutable configuration, shared by create and update. Defaults
// are applied explicitly so removing a prop converges back to the default.
const desiredConfig = (news) => ({
    EndpointConfigurations: (news.endpoints ?? []).map((e) => ({
        EndpointId: e.endpointId,
        Weight: e.weight,
        ClientIPPreservationEnabled: e.clientIPPreservationEnabled,
        AttachmentArn: e.attachmentArn,
    })),
    TrafficDialPercentage: news.trafficDialPercentage ?? 100,
    HealthCheckPort: news.healthCheckPort,
    HealthCheckProtocol: news.healthCheckProtocol ?? "TCP",
    HealthCheckPath: news.healthCheckPath,
    HealthCheckIntervalSeconds: toWireSeconds(news.healthCheckInterval) ?? 30,
    ThresholdCount: news.thresholdCount ?? 3,
    PortOverrides: (news.portOverrides ?? []).map((o) => ({
        ListenerPort: o.listenerPort,
        EndpointPort: o.endpointPort,
    })),
});
const normalizeOverrides = (overrides) => JSON.stringify((overrides ?? [])
    .map((o) => [o.ListenerPort ?? 0, o.EndpointPort ?? 0])
    .sort((a, b) => a[0] - b[0]));
// Compare observed cloud state against the desired props for every aspect we
// manage. Fields the user never specified (healthCheckPort/path) fall back to
// service-computed defaults and are only compared when explicitly desired.
const hasDrift = (live, news) => {
    if ((live.TrafficDialPercentage ?? 100) !== (news.trafficDialPercentage ?? 100)) {
        return true;
    }
    if ((live.HealthCheckProtocol ?? "TCP") !== (news.healthCheckProtocol ?? "TCP")) {
        return true;
    }
    if ((live.HealthCheckIntervalSeconds ?? 30) !==
        (toWireSeconds(news.healthCheckInterval) ?? 30)) {
        return true;
    }
    if ((live.ThresholdCount ?? 3) !== (news.thresholdCount ?? 3))
        return true;
    if (news.healthCheckPort !== undefined &&
        live.HealthCheckPort !== news.healthCheckPort) {
        return true;
    }
    if (news.healthCheckPath !== undefined &&
        live.HealthCheckPath !== news.healthCheckPath) {
        return true;
    }
    if (normalizeOverrides(live.PortOverrides) !==
        normalizeOverrides(desiredConfig(news).PortOverrides)) {
        return true;
    }
    const observed = new Map((live.EndpointDescriptions ?? []).map((d) => [d.EndpointId ?? "", d]));
    const desired = news.endpoints ?? [];
    if (observed.size !== desired.length)
        return true;
    for (const e of desired) {
        const d = observed.get(e.endpointId);
        if (!d)
            return true;
        if (e.weight !== undefined && d.Weight !== e.weight)
            return true;
        if (e.clientIPPreservationEnabled !== undefined &&
            d.ClientIPPreservationEnabled !== e.clientIPPreservationEnabled) {
            return true;
        }
    }
    return false;
};
const describeEndpointGroup = Effect.fn(function* (endpointGroupArn) {
    return yield* withGaRegion(ga.describeEndpointGroup({ EndpointGroupArn: endpointGroupArn })).pipe(Effect.map((r) => r.EndpointGroup), Effect.catchTag("EndpointGroupNotFoundException", () => Effect.succeed(undefined)));
});
// An endpoint group's natural identity is (listener, region) — GA allows at
// most one per region per listener, so this lookup is exact.
const findEndpointGroup = Effect.fn(function* (listenerArn, region) {
    if (!listenerArn || !region)
        return undefined;
    const groups = yield* withGaRegion(ga.listEndpointGroups
        .items({ ListenerArn: listenerArn })
        .pipe(Stream.runCollect)).pipe(Effect.map((chunk) => Array.from(chunk)), Effect.catchTag("ListenerNotFoundException", () => Effect.succeed([])));
    return groups.find((g) => g.EndpointGroupRegion === region);
});
export const EndpointGroupProvider = () => Provider.succeed(EndpointGroup, {
    stables: ["endpointGroupArn", "listenerArn", "endpointGroupRegion"],
    // Sub-resource keyed entirely by its parent listener (and untagged) —
    // account-wide enumeration happens via the Accelerator resource.
    list: () => Effect.succeed([]),
    read: Effect.fn(function* ({ olds, output }) {
        if (output?.endpointGroupArn) {
            const live = yield* describeEndpointGroup(output.endpointGroupArn);
            if (live)
                return toAttributes(live, output.endpointGroupArn);
        }
        const found = yield* findEndpointGroup(olds?.listenerArn, olds?.endpointGroupRegion);
        if (!found?.EndpointGroupArn)
            return undefined;
        return toAttributes(found, found.EndpointGroupArn);
    }),
    diff: Effect.fn(function* ({ news, olds }) {
        if (!isResolved(news))
            return undefined;
        if (news.listenerArn !== olds.listenerArn) {
            return { action: "replace" };
        }
        if (news.endpointGroupRegion !== olds.endpointGroupRegion) {
            return { action: "replace" };
        }
        // everything else updates in place.
    }),
    reconcile: Effect.fn(function* ({ news, output, instanceId, session }) {
        // Observe — cached ARN first, then the exact (listener, region) key.
        let live = output?.endpointGroupArn
            ? yield* describeEndpointGroup(output.endpointGroupArn)
            : undefined;
        if (!live?.EndpointGroupArn) {
            live = yield* findEndpointGroup(news.listenerArn, news.endpointGroupRegion);
        }
        // Ensure — create if missing; a concurrent create for the same
        // (listener, region) surfaces as AlreadyExists and we converge on it.
        if (!live?.EndpointGroupArn) {
            live = yield* withGaRegion(ga.createEndpointGroup({
                ListenerArn: news.listenerArn,
                EndpointGroupRegion: news.endpointGroupRegion,
                ...desiredConfig(news),
                IdempotencyToken: instanceId,
            })).pipe(Effect.map((r) => r.EndpointGroup), Effect.catchTag("EndpointGroupAlreadyExistsException", () => findEndpointGroup(news.listenerArn, news.endpointGroupRegion)));
        }
        if (!live?.EndpointGroupArn) {
            return yield* Effect.die(new Error("CreateEndpointGroup returned no endpoint group"));
        }
        const endpointGroupArn = live.EndpointGroupArn;
        // Sync — one update with the full desired config when anything drifts.
        if (hasDrift(live, news)) {
            const updated = yield* withGaRegion(ga.updateEndpointGroup({
                EndpointGroupArn: endpointGroupArn,
                ...desiredConfig(news),
            })).pipe(Effect.map((r) => r.EndpointGroup));
            if (updated)
                live = updated;
        }
        yield* session.note(endpointGroupArn);
        return toAttributes(live, endpointGroupArn);
    }),
    delete: Effect.fn(function* ({ output }) {
        yield* retryGaDeletion(withGaRegion(ga.deleteEndpointGroup({
            EndpointGroupArn: output.endpointGroupArn,
        }))).pipe(Effect.catchTag("EndpointGroupNotFoundException", () => Effect.void));
    }),
});
//# sourceMappingURL=EndpointGroup.js.map