import * as loadBalancers from "@distilled.cloud/cloudflare/load-balancers";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.LoadBalancer.MonitorGroup";
type TypeId = typeof TypeId;
/**
 * A monitor membership within a monitor group.
 */
export interface MonitorGroupMember {
    /**
     * The ID of the {@link Monitor} to include in the group.
     */
    monitorId: string;
    /**
     * Whether this member's health check is active.
     * @default true
     */
    enabled?: boolean;
    /**
     * If true, the member's results are recorded but do not affect the
     * group's aggregate health.
     * @default false
     */
    monitoringOnly?: boolean;
    /**
     * Whether this member must report healthy for the group to be healthy.
     * @default true
     */
    mustBeHealthy?: boolean;
}
export interface MonitorGroupProps {
    /**
     * A short description of the monitor group. Monitor groups have no name
     * field, so the description doubles as the group's identity for state
     * recovery — if omitted, a unique name is generated from the app, stage,
     * and logical ID.
     * @default ${app}-${stage}-${id}
     */
    description?: string;
    /**
     * List of monitors in this group.
     */
    members: ReadonlyArray<MonitorGroupMember>;
}
export interface MonitorGroupAttributes {
    /** Cloudflare-assigned monitor group identifier. */
    monitorGroupId: string;
    /** The Cloudflare account the monitor group belongs to. */
    accountId: string;
    /** Monitor group description (carries the physical name when generated). */
    description: string;
    /** ISO8601 creation timestamp. */
    createdOn: string | undefined;
    /** ISO8601 last-modified timestamp. */
    modifiedOn: string | undefined;
}
export type MonitorGroup = Resource<TypeId, MonitorGroupProps, MonitorGroupAttributes, never, Providers>;
/**
 * A Cloudflare Load Balancing monitor group — aggregates several
 * {@link Monitor}s into one health signal that a
 * {@link Pool} can reference via `monitorGroup` (mutually
 * exclusive with `monitor`).
 *
 * Monitor groups are an Enterprise-only feature; on non-entitled accounts
 * creation fails with the typed `MonitorGroupsNotEnabled` error.
 * ### Creating a Monitor Group
 * **Example:** Group of two monitors
 * ```typescript
 * const group = yield* Cloudflare.LoadBalancer.MonitorGroup("ApiChecks", {
 *   members: [
 *     { monitorId: httpsMonitor.monitorId },
 *     { monitorId: tcpMonitor.monitorId, mustBeHealthy: false },
 *   ],
 * });
 * ```
 *
 * ### Using with a Pool
 * **Example:** Attach the group to a pool
 * ```typescript
 * yield* Cloudflare.LoadBalancer.Pool("ApiPool", {
 *   origins: [{ name: "origin-1", address: "203.0.113.10" }],
 *   monitorGroup: group.monitorGroupId,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/load-balancing/monitors/
 *
 * @resource
 * @product Load Balancers
 * @category Performance & Reliability
 */
export declare const MonitorGroup: import("../../Resource.ts").ResourceClass<MonitorGroup>;
/**
 * Returns true if the given value is a MonitorGroup resource.
 */
export declare const isMonitorGroup: (value: unknown) => value is MonitorGroup;
export declare const MonitorGroupProvider: () => import("effect/Layer").Layer<Provider.Provider<MonitorGroup>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | loadBalancers.CloudflareOpContext>;
export {};
//# sourceMappingURL=MonitorGroup.d.ts.map