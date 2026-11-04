import { Services } from "@distilled.cloud/hetzner";
import * as Effect from "effect/Effect";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import type { Providers } from "./Providers.ts";
/**
 * A resource-valued prop: the resource itself, or an Effect that produces
 * it (so `yield* Zone(...)` and `Zone(...)` both type-check).
 */
type Ref<T> = T | Effect.Effect<T, never, Providers>;
/**
 * Zone identity an RRSet belongs to. A `Hetzner.Zone` resource satisfies
 * this via `zoneId`.
 */
export type RecordSetZone = {
    readonly zoneId: number;
};
export type RecordSetType = "A" | "AAAA" | "CAA" | "CNAME" | "DS" | "HINFO" | "HTTPS" | "MX" | "NS" | "PTR" | "RP" | "SOA" | "SRV" | "SVCB" | "TLSA" | "TXT" | (string & {});
export interface RecordSetRecord {
    /**
     * Record value. Interpretation depends on `type` — an A record is an
     * IPv4 address, AAAA an IPv6 address, CNAME a hostname, etc. Must be
     * unique within the RRSet. Accepts a primitive Output (e.g. a Primary
     * IP's `ip`).
     */
    value: string;
    /**
     * Optional comment shown in the Hetzner Cloud Console. Does not affect
     * DNS responses.
     */
    comment?: string;
}
export interface RecordSetProps {
    /**
     * Zone this RRSet lives in. Accepts a `Hetzner.Zone` or `{ zoneId }`.
     * Changing the zone replaces the RRSet.
     */
    zone: Ref<RecordSetZone>;
    /**
     * DNS name of the RRSet, relative to the zone. Lowercase, must not end
     * with a dot or the zone apex. Use `@` for the zone apex. Changing this
     * replaces the RRSet.
     *
     * If omitted, a unique label is generated from the stack, stage, and
     * logical ID.
     */
    name?: string;
    /**
     * DNS record type. All `records` share this type — two A values are one
     * RRSet, not two resources. Changing this replaces the RRSet.
     */
    type: RecordSetType;
    /**
     * Records in this RRSet. Must be non-empty and contain distinct values.
     * Order is not significant. Mutable — updates in place.
     */
    records: RecordSetRecord[];
    /**
     * TTL in seconds (`60`–`2147483647`). Omit to use the Zone's default TTL
     * on create and leave the live value alone on update.
     */
    ttl?: number;
    /**
     * User-defined labels. Alchemy ownership labels (`alchemy.stack`,
     * `alchemy.stage`, `alchemy.id`) are always merged in.
     */
    labels?: Record<string, string>;
    /**
     * Prevent the RRSet from being changed or deleted via the API.
     *
     * @default false
     */
    changeProtection?: boolean;
}
export interface RecordSetAttributes {
    /**
     * RRSet id (`{name}/{type}`, e.g. `www/A`). Stable across updates.
     */
    id: string;
    /**
     * Numeric Cloud API id of the parent Zone.
     */
    zoneId: number;
    /**
     * DNS name of the RRSet (`@` for the apex).
     */
    name: string;
    /**
     * DNS record type.
     */
    type: RecordSetType;
    /**
     * TTL in seconds, or `undefined` when the Zone default applies.
     */
    ttl: number | undefined;
    /**
     * Records currently published. Order is not significant.
     */
    records: RecordSetRecord[];
    /**
     * User-defined labels (Alchemy ownership labels stripped).
     */
    labels: Record<string, string>;
    /**
     * Whether change protection is enabled.
     */
    changeProtection: boolean;
}
export type RecordSet = Resource<"Hetzner.RecordSet", RecordSetProps, RecordSetAttributes, never, Providers>;
/**
 * A Hetzner Cloud DNS resource record set (RRSet) — one `(name, type)`
 * with one or more records. Two A values are a single resource, not two.
 *
 * Identity is `(zone, name, type)`: changing any of those replaces the
 * RRSet. Records, TTL, labels, and change protection update in place.
 * Only primary Zones accept RRSet edits.
 *
 * @see https://docs.hetzner.cloud/reference/cloud#zone-rrsets
 *
 * ### Creating an RRSet
 * **Example:** A records on a subdomain
 * ```typescript
 * const zone = yield* Hetzner.Zone("example", {
 *   name: "example.com",
 * });
 * const www = yield* Hetzner.RecordSet("www", {
 *   zone,
 *   name: "www",
 *   type: "A",
 *   records: [
 *     { value: "192.0.2.1" },
 *     { value: "192.0.2.2" },
 *   ],
 *   ttl: 300,
 * });
 * ```
 *
 * **Example:** Apex A record from a Primary IP
 * ```typescript
 * const ip = yield* Hetzner.PrimaryIp("web-ip", {
 *   type: "ipv4",
 *   location: "nbg1",
 * });
 * const apex = yield* Hetzner.RecordSet("apex", {
 *   zone,
 *   name: "@",
 *   type: "A",
 *   records: [{ value: ip.ip }],
 * });
 * ```
 *
 * ### Updating records
 * **Example:** Replace the record set and TTL
 * ```typescript
 * const www = yield* Hetzner.RecordSet("www", {
 *   zone,
 *   name: "www",
 *   type: "A",
 *   records: [{ value: "192.0.2.10" }],
 *   ttl: 600,
 * });
 * ```
 *
 * @resource
 */
export declare const RecordSet: import("../Resource.ts").ResourceClass<RecordSet>;
declare const RecordSetZoneMissing_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Hetzner.RecordSetZoneMissing";
} & Readonly<A>;
export declare class RecordSetZoneMissing extends RecordSetZoneMissing_base<{
    name: string;
    type: string;
}> {
}
export declare const RecordSetProvider: () => import("effect/Layer").Layer<Provider.Provider<RecordSet>, never, import("../Stack.ts").Stack | import("../Stage.ts").Stage | Services.actions.HetznerOpContext>;
export {};
//# sourceMappingURL=RecordSet.d.ts.map