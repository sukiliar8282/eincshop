import { Services } from "@distilled.cloud/hetzner";
import * as Effect from "effect/Effect";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import type { Providers } from "./Providers.ts";
/**
 * Placement Group type. Hetzner currently offers only `spread` — Servers
 * in the group are placed on distinct physical hosts.
 */
export type PlacementGroupType = "spread";
export interface PlacementGroupProps {
    /**
     * Name of the Placement Group. Must be unique per Hetzner project. If
     * omitted, a unique name is generated from `${stack}-${id}-${stage}`.
     */
    name?: string;
    /**
     * Placement strategy. `spread` places each Server on a different
     * physical host. Cannot be changed after creation — changing it
     * replaces the group.
     *
     * @default "spread"
     */
    type?: PlacementGroupType;
    /**
     * User-defined labels (`key/value` pairs). Alchemy ownership labels
     * (`alchemy.stack`, `alchemy.stage`, `alchemy.id`) are merged in
     * automatically.
     */
    labels?: Record<string, string>;
}
export type PlacementGroup = Resource<"Hetzner.PlacementGroup", PlacementGroupProps, {
    /**
     * Numeric Hetzner Placement Group ID.
     */
    id: number;
    /**
     * Name of the Placement Group. Unique per project.
     */
    name: string;
    /**
     * Placement strategy. Currently always `spread`.
     */
    type: PlacementGroupType;
    /**
     * User-defined labels (Alchemy ownership labels stripped).
     */
    labels: Record<string, string>;
    /**
     * RFC3339 timestamp of when the Placement Group was created.
     */
    created: string;
    /**
     * IDs of Servers currently assigned to this group. Server
     * attachment is configured on the Server resource.
     */
    servers: number[];
}, never, Providers>;
/**
 * A Hetzner Cloud Placement Group. Spread groups keep member Servers on
 * distinct physical hosts so a single hardware failure cannot take them
 * all down. Type is `spread` (the only type Hetzner currently offers)
 * and is immutable — changing it replaces the group. Name and labels
 * update in place.
 *
 * Servers are attached from the Server resource (not here).
 *
 * @see https://docs.hetzner.cloud/reference/cloud#placement-groups
 *
 * ### Creating a Placement Group
 * **Example:** Basic spread group
 * ```typescript
 * const group = yield* Hetzner.PlacementGroup("web");
 * ```
 *
 * **Example:** Named group with labels
 * ```typescript
 * const group = yield* Hetzner.PlacementGroup("web", {
 *   name: "web-spread",
 *   type: "spread",
 *   labels: { role: "web" },
 * });
 * ```
 *
 * @resource
 */
export declare const PlacementGroup: import("../Resource.ts").ResourceClass<PlacementGroup>;
declare const PlacementGroupNotResolved_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Hetzner.PlacementGroupNotResolved";
} & Readonly<A>;
export declare class PlacementGroupNotResolved extends PlacementGroupNotResolved_base<{
    name: string;
}> {
}
/**
 * Poll `getPlacementGroup` until it returns the typed `NotFound` tag.
 * Bounded to 10 attempts at 1s spacing.
 */
export declare const waitUntilPlacementGroupGone: (id: number) => Effect.Effect<"gone", import("@distilled.cloud/fly-io").BadRequest | import("@distilled.cloud/fly-io").ConfigError | import("@distilled.cloud/fly-io").Conflict | import("@distilled.cloud/fly-io").Forbidden | import("effect/unstable/http/HttpClientError").HttpClientError | import("@distilled.cloud/fly-io").Locked | import("@distilled.cloud/fly-io").UnprocessableEntity | import("@distilled.cloud/hetzner").ClientErrors | import("@distilled.cloud/planetscale").DefaultErrors, Services.actions.HetznerOpContext>;
export declare const PlacementGroupProvider: () => import("effect/Layer").Layer<Provider.Provider<PlacementGroup>, never, import("../Stack.ts").Stack | import("../Stage.ts").Stage | Services.actions.HetznerOpContext>;
export {};
//# sourceMappingURL=PlacementGroup.d.ts.map