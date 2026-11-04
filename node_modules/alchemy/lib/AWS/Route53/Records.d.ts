import * as route53 from "@distilled.cloud/aws/route-53";
import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import { type RecordAliasTarget, type ResolvedRecordAliasTarget } from "./Record.ts";
/**
 * Binding contract of {@link Records}: composites (e.g. an
 * `AWS.Website.StaticSite` attached to an `AWS.Website.Router`) contribute
 * additional record names without a circular input prop.
 */
export type RecordsBinding = {
    /**
     * Additional record names to manage alongside {@link RecordsProps.names}.
     */
    names?: string[];
};
export interface RecordsProps {
    /**
     * Hosted zone that owns the records. When omitted, the most specific
     * PUBLIC hosted zone in the account containing the set's first name is
     * inferred by walking its parent domains; the deploy fails actionably
     * when no zone matches. Every name in the set lives in the one zone
     * either way.
     */
    hostedZoneId?: string;
    /**
     * Record type shared by every record in the set.
     */
    type: route53.RRType;
    /**
     * Record names managed by this set. Names contributed through the binding
     * contract (see {@link RecordsBinding}) are merged in at reconcile time.
     */
    names?: string[];
    /**
     * TTL for non-alias records, e.g. `"60 seconds"` (a bare number is
     * milliseconds). Rounded to whole seconds on the wire.
     */
    ttl?: Duration.Input;
    /**
     * Record values for non-alias records (shared by every name in the set).
     */
    records?: string[];
    /**
     * Alias target for alias records (shared by every name in the set).
     */
    aliasTarget?: RecordAliasTarget;
}
export interface Records extends Resource<"AWS.Route53.Records", RecordsProps, {
    /**
     * Hosted zone that owns the records. `undefined` only while the set
     * is empty with no explicit zone — resolved (explicit or inferred) on
     * the first reconcile that has a name.
     */
    hostedZoneId: string | undefined;
    /**
     * Record type shared by every record in the set.
     */
    type: route53.RRType;
    /**
     * Fully qualified names of every record currently managed by this set
     * (declared `names` plus bound names, as of the last reconcile).
     */
    names: string[];
    /**
     * Current TTL for non-alias records.
     */
    ttl: number | undefined;
    /**
     * Current non-alias record values.
     */
    records: string[] | undefined;
    /**
     * Current alias target, when the set manages alias records.
     */
    aliasTarget: ResolvedRecordAliasTarget | undefined;
}, RecordsBinding, Providers> {
}
/**
 * A dynamic set of identically-configured Route 53 records that differ only
 * by name.
 *
 * Unlike {@link Record} (one resource per record), `Records` reconciles a
 * whole name set against the hosted zone — names added to the set are
 * upserted, names removed from the set are deleted. The set is the union of
 * the declared `names` prop and names contributed through the
 * {@link RecordsBinding} binding contract, which is how composites (e.g. a
 * site attached to an `AWS.Website.Router`) register hostnames on a
 * distribution's DNS without a circular input prop.
 * ### Managing Record Sets
 * **Example:** Alias Records For Several Hostnames
 * ```typescript
 * const records = yield* Records("AliasRecords", {
 *   hostedZoneId: "Z1234567890",
 *   type: "A",
 *   names: ["www.example.com", "docs.example.com"],
 *   aliasTarget: {
 *     hostedZoneId: distribution.hostedZoneId,
 *     dnsName: distribution.domainName,
 *   },
 * });
 * ```
 *
 * **Example:** Binding Target For Composite-Contributed Names
 * ```typescript
 * // Names may also arrive through the binding contract — an
 * // `AWS.Website.Router` declares an empty set and attached sites bind
 * // their hostnames onto it:
 * const records = yield* Records("SiteAliasRecords", {
 *   hostedZoneId: "Z1234567890",
 *   type: "A",
 *   aliasTarget: {
 *     hostedZoneId: distribution.hostedZoneId,
 *     dnsName: distribution.domainName,
 *   },
 * });
 * // elsewhere:
 * yield* records.bind`MySite`({ names: ["docs.example.com"] });
 * ```
 *
 * @resource
 */
export declare const Records: import("../../Resource.ts").ResourceClass<Records>;
export declare const RecordsProvider: () => import("effect/Layer").Layer<Provider.Provider<Records>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=Records.d.ts.map