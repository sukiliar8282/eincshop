import * as route53 from "@distilled.cloud/aws/route-53";
import type * as Duration from "effect/Duration";
import type { Input } from "../../Input.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface RecordAliasTarget {
    /**
     * Hosted zone ID for the alias target.
     */
    hostedZoneId: Input<string>;
    /**
     * DNS name for the alias target.
     */
    dnsName: Input<string>;
    /**
     * Whether Route 53 should evaluate target health for the alias.
     * @default false
     */
    evaluateTargetHealth?: boolean;
}
/**
 * Fully-resolved alias target as stored in the record's attributes — a
 * `RecordAliasTarget` with all `Input` values resolved.
 */
export interface ResolvedRecordAliasTarget {
    /**
     * Hosted zone ID for the alias target.
     */
    hostedZoneId: string;
    /**
     * DNS name for the alias target.
     */
    dnsName: string;
    /**
     * Whether Route 53 evaluates target health for the alias.
     * @default false
     */
    evaluateTargetHealth?: boolean;
}
export interface RecordGeoLocation {
    /**
     * Two-letter continent code (e.g. `"NA"`, `"EU"`). Mutually exclusive with
     * `countryCode`.
     */
    continentCode?: string;
    /**
     * Two-letter country code, or `"*"` for the default (catch-all) record.
     */
    countryCode?: string;
    /**
     * Subdivision code (e.g. a US state). Requires `countryCode`.
     */
    subdivisionCode?: string;
}
export interface RecordGeoProximityCoordinates {
    /** Latitude as a string (e.g. `"49.22"`). */
    latitude: string;
    /** Longitude as a string (e.g. `"-122.41"`). */
    longitude: string;
}
export interface RecordGeoProximityLocation {
    /** AWS Region for the endpoint. Mutually exclusive with `coordinates`. */
    awsRegion?: string;
    /** Local Zone Group for the endpoint. */
    localZoneGroup?: string;
    /** Explicit latitude/longitude of the endpoint. */
    coordinates?: RecordGeoProximityCoordinates;
    /** Bias (-99 to 99) that expands or shrinks the geographic region. */
    bias?: number;
}
export interface RecordCidrRoutingConfig {
    /** ID of the CIDR collection. */
    collectionId: string;
    /** Name of the CIDR location within the collection. */
    locationName: string;
}
export interface RecordProps {
    /**
     * Hosted zone that owns the record. When omitted, the most specific
     * PUBLIC hosted zone in the account containing `name` is inferred by
     * walking the name's parent domains (`svc.api.example.com` →
     * `api.example.com` → `example.com`); the deploy fails actionably when
     * no zone matches.
     */
    hostedZoneId?: string;
    /**
     * Record name.
     */
    name: string;
    /**
     * Record type.
     */
    type: route53.RRType;
    /**
     * TTL for non-alias records, e.g. `"60 seconds"` or `Duration.minutes(5)`
     * (a bare number is milliseconds). Rounded to whole seconds on the wire.
     */
    ttl?: Duration.Input;
    /**
     * Record values for non-alias records.
     */
    records?: string[];
    /**
     * Alias target for alias records.
     */
    aliasTarget?: RecordAliasTarget;
    /**
     * Optional set identifier for weighted, latency, failover, and other routing
     * policies that require unique record identities.
     */
    setIdentifier?: string;
    /**
     * Weight (0-255) for weighted routing. Requires `setIdentifier`.
     */
    weight?: number;
    /**
     * AWS Region for latency-based routing. Requires `setIdentifier`.
     */
    region?: route53.ResourceRecordSetRegion;
    /**
     * Failover role for failover routing. Requires `setIdentifier`.
     */
    failover?: "PRIMARY" | "SECONDARY";
    /**
     * Geolocation routing rule. Requires `setIdentifier`.
     */
    geoLocation?: RecordGeoLocation;
    /**
     * Geoproximity routing rule. Requires `setIdentifier`.
     */
    geoProximityLocation?: RecordGeoProximityLocation;
    /**
     * Whether this record participates in multivalue answer routing. Requires
     * `setIdentifier`.
     */
    multiValueAnswer?: boolean;
    /**
     * IP-based (CIDR) routing rule. Requires `setIdentifier`.
     */
    cidrRoutingConfig?: RecordCidrRoutingConfig;
    /**
     * Health check that gates whether Route 53 returns this record. Typically a
     * `HealthCheck.id`.
     */
    healthCheckId?: string;
}
export interface Record extends Resource<"AWS.Route53.Record", RecordProps, {
    /**
     * Hosted zone that owns the record.
     */
    hostedZoneId: string;
    /**
     * Fully qualified record name.
     */
    name: string;
    /**
     * Record type.
     */
    type: route53.RRType;
    /**
     * Current TTL for non-alias records.
     */
    ttl: number | undefined;
    /**
     * Current non-alias record values.
     */
    records: string[] | undefined;
    /**
     * Current alias target, when this record is an alias.
     */
    aliasTarget: ResolvedRecordAliasTarget | undefined;
    /**
     * Optional routing set identifier.
     */
    setIdentifier: string | undefined;
    /**
     * Weight for weighted routing.
     */
    weight: number | undefined;
    /**
     * AWS Region for latency routing.
     */
    region: route53.ResourceRecordSetRegion | undefined;
    /**
     * Failover role for failover routing.
     */
    failover: "PRIMARY" | "SECONDARY" | undefined;
    /**
     * Geolocation routing rule.
     */
    geoLocation: RecordGeoLocation | undefined;
    /**
     * Geoproximity routing rule.
     */
    geoProximityLocation: RecordGeoProximityLocation | undefined;
    /**
     * Whether this record participates in multivalue answer routing.
     */
    multiValueAnswer: boolean | undefined;
    /**
     * IP-based (CIDR) routing rule.
     */
    cidrRoutingConfig: RecordCidrRoutingConfig | undefined;
    /**
     * Health check that gates this record.
     */
    healthCheckId: string | undefined;
}, never, Providers> {
}
/**
 * A Route 53 DNS record set.
 *
 * `Record` manages a single Route 53 record set using `UPSERT` for create and
 * update operations, and waits for Route 53 change propagation before
 * returning.
 * ### Creating Records
 * **Example:** A Record Alias To CloudFront
 * ```typescript
 * const record = yield* Record("WebsiteAlias", {
 *   hostedZoneId: "Z1234567890",
 *   name: "www.example.com",
 *   type: "A",
 *   aliasTarget: {
 *     hostedZoneId: distribution.hostedZoneId,
 *     dnsName: distribution.domainName,
 *   },
 * });
 * ```
 *
 * **Example:** TXT Record
 * ```typescript
 * const record = yield* Record("VerificationRecord", {
 *   hostedZoneId: "Z1234567890",
 *   name: "_acme-challenge.example.com",
 *   type: "TXT",
 *   ttl: "60 seconds",
 *   records: ["\"value\""],
 * });
 * ```
 *
 * ### Routing Policies
 * **Example:** Weighted Routing
 * ```typescript
 * const blue = yield* Record("Blue", {
 *   hostedZoneId: zone.id,
 *   name: "api.example.com",
 *   type: "A",
 *   ttl: "60 seconds",
 *   records: ["1.2.3.4"],
 *   setIdentifier: "blue",
 *   weight: 90,
 * });
 * const green = yield* Record("Green", {
 *   hostedZoneId: zone.id,
 *   name: "api.example.com",
 *   type: "A",
 *   ttl: "60 seconds",
 *   records: ["5.6.7.8"],
 *   setIdentifier: "green",
 *   weight: 10,
 * });
 * ```
 *
 * **Example:** Failover Routing With Health Check
 * ```typescript
 * const primary = yield* Record("Primary", {
 *   hostedZoneId: zone.id,
 *   name: "app.example.com",
 *   type: "A",
 *   ttl: "60 seconds",
 *   records: ["1.2.3.4"],
 *   setIdentifier: "primary",
 *   failover: "PRIMARY",
 *   healthCheckId: healthCheck.id,
 * });
 * const secondary = yield* Record("Secondary", {
 *   hostedZoneId: zone.id,
 *   name: "app.example.com",
 *   type: "A",
 *   ttl: "60 seconds",
 *   records: ["5.6.7.8"],
 *   setIdentifier: "secondary",
 *   failover: "SECONDARY",
 * });
 * ```
 *
 * **Example:** Latency Routing
 * ```typescript
 * const record = yield* Record("UsEast", {
 *   hostedZoneId: zone.id,
 *   name: "api.example.com",
 *   type: "A",
 *   ttl: "60 seconds",
 *   records: ["1.2.3.4"],
 *   setIdentifier: "us-east-1",
 *   region: "us-east-1",
 * });
 * ```
 *
 * **Example:** Geolocation Routing
 * ```typescript
 * const record = yield* Record("Default", {
 *   hostedZoneId: zone.id,
 *   name: "www.example.com",
 *   type: "A",
 *   ttl: "60 seconds",
 *   records: ["1.2.3.4"],
 *   setIdentifier: "default",
 *   geoLocation: { countryCode: "*" },
 * });
 * ```
 *
 * @resource
 */
export declare const Record: import("../../Resource.ts").ResourceClass<Record>;
/** @internal shared with `Records.ts` — not exported from the barrel. */
export declare const normalizeHostedZoneId: (hostedZoneId: string) => string;
/** @internal shared with `Records.ts` — not exported from the barrel. */
export declare const normalizeName: (name: string) => string;
/** @internal shared with `Records.ts` — not exported from the barrel. */
export declare const toAliasTarget: (aliasTarget: route53.AliasTarget | undefined) => ResolvedRecordAliasTarget | undefined;
/**
 * Build the full `ResourceRecordSet` wire shape from props. Used for both the
 * UPSERT change batch and the DELETE change batch — DELETE requires an exact
 * match of every policy field, so this must round-trip the entire surface.
 * @internal shared with `Records.ts` — not exported from the barrel.
 */
export declare const toRecordSet: (props: Pick<RecordProps, "name" | "type" | "records" | "aliasTarget" | "setIdentifier" | "weight" | "region" | "failover" | "geoLocation" | "geoProximityLocation" | "multiValueAnswer" | "cidrRoutingConfig" | "healthCheckId"> & {
    /** TTL already converted to wire seconds. */
    ttl?: number;
}) => route53.ResourceRecordSet;
export declare const RecordProvider: () => import("effect/Layer").Layer<Provider.Provider<Record>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=Record.d.ts.map