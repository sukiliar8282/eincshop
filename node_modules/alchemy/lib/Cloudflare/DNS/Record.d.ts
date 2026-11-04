import * as dns from "@distilled.cloud/cloudflare/dns";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
/**
 * DNS record type literal — every value Cloudflare recognises. Stable
 * across reconciles; changing it triggers a replacement because record
 * type is part of a record's identity.
 */
export type RecordType = "A" | "AAAA" | "CNAME" | "MX" | "NS" | "OPENPGPKEY" | "PTR" | "TXT" | "CAA" | "CERT" | "DNSKEY" | "DS" | "HTTPS" | "LOC" | "NAPTR" | "SMIMEA" | "SRV" | "SSHFP" | "SVCB" | "TLSA" | "URI" | (string & {});
/**
 * Cloudflare's structured DNS record components, keyed by record type.
 */
export interface RecordDataByType {
    CAA: dns.RecordsCreateRequestDataCAARecord;
    CERT: dns.RecordsCreateRequestDataCERTRecord;
    DNSKEY: dns.RecordsCreateRequestDataDNSKEYRecord;
    DS: dns.RecordsCreateRequestDataDSRecord;
    HTTPS: dns.RecordsCreateRequestDataHTTPSRecord;
    LOC: dns.RecordsCreateRequestDataLOCRecord;
    NAPTR: dns.RecordsCreateRequestDataNAPTRRecord;
    SMIMEA: dns.RecordsCreateRequestDataSMIMEARecord;
    SRV: dns.RecordsCreateRequestDataSRVRecord;
    SSHFP: dns.RecordsCreateRequestDataSSHFPRecord;
    SVCB: dns.RecordsCreateRequestDataHTTPSRecord;
    TLSA: dns.RecordsCreateRequestDataSMIMEARecord;
    URI: dns.RecordsCreateRequestDataURIRecord;
}
/** Structured DNS record components accepted by Cloudflare. */
export type RecordData = RecordDataByType[keyof RecordDataByType];
export interface RecordCommonProps {
    /**
     * Zone the record lives in. Stable — changing the zone triggers
     * replacement.
     */
    zoneId: string;
    /**
     * Fully-qualified or zone-relative record name (e.g.
     * `cluster-admin.microtrack.ai`, `_dmarc`, or `@` for the zone apex).
     * Cloudflare normalizes relative names to their fully-qualified form.
     *
     * Stable — Cloudflare treats `(name, type)` as the record's identity,
     * so a rename is a delete + create. Declared as plain `string` (not
     * `string`) so it is statically knowable inside `diff`.
     */
    name: string;
    /**
     * TTL in seconds (`60`–`86400`), or `"1"` for Cloudflare's "automatic"
     * setting. Must be `"1"` when `proxied` is `true`.
     *
     * @default "1"
     */
    ttl?: number | "1";
    /**
     * Whether to send the record through Cloudflare's proxy (orange-clouded
     * in the dashboard). Only valid for proxiable record types
     * (`A`, `AAAA`, `CNAME`).
     *
     * @default false
     */
    proxied?: boolean;
    /**
     * Free-form comment shown in the dashboard. No effect on DNS responses.
     */
    comment?: string;
    /**
     * Custom tags shown in the dashboard. No effect on DNS responses.
     */
    tags?: ReadonlyArray<string>;
}
type StringRecordType = Exclude<RecordType, keyof RecordDataByType | "MX">;
type StringRecordProps = {
    /** Record type. Stable — changing triggers replacement. */
    type: StringRecordType;
    /** Formatted record value. Mutable — patched in place. */
    content: string;
    priority?: never;
};
interface MxRecordProps {
    /** Record type. Stable — changing triggers replacement. */
    type: "MX";
    /** Mail server hostname. Mutable — patched in place. */
    content: string;
    /** Mail server priority; lower values are preferred. */
    priority?: number;
}
type StructuredRecordProps = {
    [Type in keyof RecordDataByType]: {
        /** Record type. Stable — changing triggers replacement. */
        type: Type;
        /**
         * Record value as formatted DNS content or typed Cloudflare components.
         * Mutable — patched in place.
         */
        content: string | RecordDataByType[Type];
        /**
         * Top-level priority, used by URI records. SRV, SVCB, and HTTPS put their
         * priority inside structured `content`.
         */
        priority?: Type extends "URI" ? number : never;
    };
}[keyof RecordDataByType];
/** Input properties for a Cloudflare DNS record. */
export type RecordProps = RecordCommonProps & (StringRecordProps | MxRecordProps | StructuredRecordProps);
export interface RecordAttributes {
    /** Cloudflare-assigned DNS record UUID. */
    recordId: string;
    /** Zone that owns this record. */
    zoneId: string;
    /** Record name (FQDN, as Cloudflare returns it). */
    name: string;
    /** Record type. */
    type: RecordType;
    /** Formatted record value returned by Cloudflare. */
    content: string;
    /** Structured record components, when Cloudflare returns them. */
    data?: RecordData;
    /** Resolved TTL (Cloudflare echoes `1` for "automatic"). */
    ttl: number;
    /** Whether the record is proxied. */
    proxied: boolean;
    /** ISO8601 creation timestamp. */
    createdOn: string | undefined;
    /** ISO8601 last-modified timestamp. */
    modifiedOn: string | undefined;
}
export type Record = Resource<"Cloudflare.DNS.Record", RecordProps, RecordAttributes, never, Providers>;
/**
 * A single DNS record on a Cloudflare-managed zone.
 *
 * Safety: when there is no prior state, `read` scans the zone for an
 * existing `(name, type)` match. DNS records carry no ownership markers
 * we can inspect, so an existing match is reported as `Unowned` and the
 * engine refuses to take it over unless `--adopt` (or `adopt(true)`) is
 * set. This protects hand-edited records (especially the apex `A`/`AAAA`
 * and email DKIM/SPF records that the dashboard often manages) from
 * being clobbered.
 *
 * Several records may legitimately share `(name, type)` — MX fallbacks,
 * multiple TXT records, round-robin A records. When the scan finds more
 * than one candidate, the declared `content` (and `priority`) must match
 * exactly one record; a record with no exact match is treated as missing
 * (a new sibling record is created), and a still-ambiguous match fails
 * with an error listing the candidates. To adopt one record out of such
 * a set, declare its current `content`/`priority` verbatim first, then
 * change them in a follow-up deploy.
 * ### Proxied CNAME pointing at a tunnel
 * **Example:** Route a subdomain through a Cloudflare Tunnel
 * ```typescript
 * yield* Cloudflare.DNS.Record("AdminCname", {
 *   zoneId: zone.zoneId,
 *   name: "cluster-admin.example.com",
 *   type: "CNAME",
 *   content: `${tunnel.tunnelId}.cfargotunnel.com`,
 *   proxied: true,
 *   comment: "research admin UI",
 * });
 * ```
 *
 * ### Plain A record
 * **Example:** Direct A record (not proxied)
 * ```typescript
 * yield* Cloudflare.DNS.Record("ApiA", {
 *   zoneId: zone.zoneId,
 *   name: "api.example.com",
 *   type: "A",
 *   content: "203.0.113.42",
 *   ttl: 300,
 * });
 * ```
 *
 * ### Structured service binding records
 * **Example:** SVCB record
 * ```typescript
 * yield* Cloudflare.DNS.Record("McpSvcb", {
 *   zoneId: zone.zoneId,
 *   name: "_mcp._agents.example.com",
 *   type: "SVCB",
 *   content: {
 *     priority: 1,
 *     target: "mcp.example.com.",
 *     value: 'mandatory="alpn,port" alpn="h2,h3" port="443"',
 *   },
 * });
 * ```
 *
 * **Example:** HTTPS record
 * ```typescript
 * yield* Cloudflare.DNS.Record("WebsiteHttps", {
 *   zoneId: zone.zoneId,
 *   name: "example.com",
 *   type: "HTTPS",
 *   content: {
 *     priority: 1,
 *     target: ".",
 *     value: 'alpn="h2,h3"',
 *   },
 * });
 * ```
 *
 * @resource
 * @product DNS
 * @category Domains & DNS
 */
export declare const Record: import("../../Resource.ts").ResourceClass<Record>;
export declare const RecordProvider: () => import("effect/Layer").Layer<Provider.Provider<Record>, never, CloudflareEnvironment | dns.CloudflareOpContext>;
declare const AmbiguousDnsRecordError_base: new <A extends globalThis.Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "AmbiguousDnsRecordError";
} & Readonly<A>;
/**
 * Raised when several DNS records share `(name, type)` and the declared
 * `content`/`data`/`priority` do not select exactly one of them — adoption must
 * never pick a record arbitrarily.
 */
export declare class AmbiguousDnsRecordError extends AmbiguousDnsRecordError_base<{
    readonly zoneId: string;
    readonly name: string;
    readonly type: RecordType;
    readonly candidates: ReadonlyArray<{
        readonly id?: string;
        readonly content?: string;
        readonly data?: RecordData;
        readonly priority?: number;
    }>;
    readonly message: string;
}> {
}
export {};
//# sourceMappingURL=Record.d.ts.map