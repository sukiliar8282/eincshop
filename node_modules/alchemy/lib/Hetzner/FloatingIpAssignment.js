import { Services } from "@distilled.cloud/hetzner";
import * as Data from "effect/Data";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { isResolved } from "../Diff.js";
import * as Provider from "../Provider.js";
import { Resource } from "../Resource.js";
import { waitForAction } from "./actions.js";
import { alchemyStackSelector } from "./Labels.js";
export class FloatingIpAssignmentError extends Data.TaggedError("FloatingIpAssignmentError") {
}
/**
 * Assigns a Hetzner Cloud {@link FloatingIp} to a Server. The assignment
 * is existence-only: observe the Floating IP and ensure it is bound to
 * the Server. Changing either reference updates in place (the previous
 * IP is unassigned, then the new pair is assigned).
 *
 * A Floating IP can be assigned to at most one Server at a time. A Server
 * may hold many Floating IPs. Destroying the assignment unassigns the IP
 * but leaves both the Floating IP and the Server in place.
 *
 * @see https://docs.hetzner.cloud/reference/cloud#floating-ip-actions-assign-a-floating-ip-to-a-server
 *
 * ### Assigning a Floating IP
 * **Example:** Assign an IPv4 to a Server
 * ```typescript
 * const server = yield* Hetzner.Server("web", {
 *   image: "ubuntu-24.04",
 *   serverType: "cx23",
 *   location: "nbg1",
 * });
 * const ip = yield* Hetzner.FloatingIp("public-ip", {
 *   type: "ipv4",
 *   homeLocation: "nbg1",
 * });
 * const assignment = yield* Hetzner.FloatingIpAssignment("public-ip-web", {
 *   floatingIp: ip,
 *   server,
 * });
 * ```
 *
 * **Example:** Assign with stub identities
 * ```typescript
 * const assignment = yield* Hetzner.FloatingIpAssignment("public-ip-web", {
 *   floatingIp: { id: 123 },
 *   server: { serverId: 42 },
 * });
 * ```
 *
 * @resource
 */
export const FloatingIpAssignment = Resource("Hetzner.FloatingIpAssignment");
const floatingIpIdOf = (value) => {
    if (value === null || typeof value !== "object")
        return undefined;
    const rec = value;
    if (typeof rec.id === "number")
        return rec.id;
    if (typeof rec.floatingIpId === "number")
        return rec.floatingIpId;
    return undefined;
};
const serverIdOf = (value) => {
    if (value === null || typeof value !== "object")
        return undefined;
    const rec = value;
    if (typeof rec.serverId === "number")
        return rec.serverId;
    if (typeof rec.id === "number")
        return rec.id;
    return undefined;
};
const toAttrs = (ip) => {
    if (ip.server === null)
        return undefined;
    return {
        floatingIpId: ip.id,
        serverId: ip.server,
    };
};
const getById = (id) => Services.floatingIps.getFloatingIp({ id }).pipe(Effect.map(({ floating_ip }) => floating_ip), Effect.catchTag("NotFound", () => Effect.succeed(undefined)));
const refresh = (id) => Services.floatingIps.getFloatingIp({ id }).pipe(Effect.map(({ floating_ip }) => floating_ip), Effect.retry({
    while: (e) => e._tag === "NotFound",
    times: 5,
    schedule: Schedule.min([
        Schedule.exponential(Duration.millis(200), 1.5),
        Schedule.spaced(Duration.seconds(2)),
    ]),
}));
const observeAssignment = (floatingIpId, serverId) => Effect.gen(function* () {
    const ip = yield* getById(floatingIpId);
    if (ip === undefined)
        return undefined;
    if (ip.server !== serverId)
        return undefined;
    return ip;
});
const unassignIfNeeded = (ip) => Effect.gen(function* () {
    if (ip.server === null)
        return ip;
    const { action } = yield* Services.floatingIpActions.unassignFloatingIp({
        id: ip.id,
    });
    yield* waitForAction(action);
    return yield* refresh(ip.id);
});
const assignTo = (ip, serverId) => Effect.gen(function* () {
    if (ip.server === serverId)
        return ip;
    const { action } = yield* Services.floatingIpActions.assignFloatingIp({
        id: ip.id,
        server: serverId,
    });
    yield* waitForAction(action);
    return yield* refresh(ip.id);
});
export const FloatingIpAssignmentProvider = () => Provider.succeed(FloatingIpAssignment, {
    stables: ["floatingIpId", "serverId"],
    nuke: { dependsOn: ["Hetzner.FloatingIp", "Hetzner.Server"] },
    list: Effect.fn(function* () {
        const items = yield* Services.floatingIps.listFloatingIps
            .items({ label_selector: alchemyStackSelector, per_page: 50 })
            .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)));
        return items.flatMap((ip) => {
            const attrs = toAttrs(ip);
            return attrs === undefined ? [] : [attrs];
        });
    }),
    diff: Effect.fn(function* ({ news }) {
        if (!isResolved(news))
            return undefined;
        return undefined;
    }),
    read: Effect.fn(function* ({ output }) {
        if (output === undefined)
            return undefined;
        const found = yield* observeAssignment(output.floatingIpId, output.serverId);
        return found === undefined ? undefined : toAttrs(found);
    }),
    reconcile: Effect.fn(function* ({ news, output }) {
        const floatingIpId = floatingIpIdOf(news.floatingIp);
        const serverId = serverIdOf(news.server);
        if (floatingIpId === undefined || serverId === undefined) {
            return yield* new FloatingIpAssignmentError({
                message: "FloatingIpAssignment requires a resolved floatingIp and server",
            });
        }
        // Observe — cloud assignment on the Floating IP is authoritative.
        let current = yield* getById(floatingIpId);
        if (current === undefined) {
            current = yield* refresh(floatingIpId);
        }
        // Ensure — the pair exists. Release a previously owned IP first so
        // an in-place retarget does not leave the old address assigned.
        if (output !== undefined && output.floatingIpId !== floatingIpId) {
            const previous = yield* getById(output.floatingIpId);
            if (previous !== undefined && previous.server === output.serverId) {
                yield* unassignIfNeeded(previous);
            }
        }
        if (current.server !== serverId) {
            current = yield* unassignIfNeeded(current);
            current = yield* assignTo(current, serverId);
        }
        const attrs = toAttrs(current);
        if (attrs === undefined) {
            return yield* new FloatingIpAssignmentError({
                message: "FloatingIpAssignment reconcile finished without an assignment",
            });
        }
        return attrs;
    }),
    delete: Effect.fn(function* ({ output }) {
        const current = yield* getById(output.floatingIpId);
        if (current === undefined)
            return;
        if (current.server !== output.serverId)
            return;
        yield* unassignIfNeeded(current);
    }),
});
//# sourceMappingURL=FloatingIpAssignment.js.map