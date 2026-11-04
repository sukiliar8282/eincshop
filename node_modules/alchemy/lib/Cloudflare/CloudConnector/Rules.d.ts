import * as cloudConnector from "@distilled.cloud/cloudflare/cloud-connector";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.CloudConnector.Rules";
type TypeId = typeof TypeId;
/**
 * The cloud-provider object storage a Cloud Connector rule routes matching
 * traffic to.
 */
export type CloudConnectorProvider = "aws_s3" | "cloudflare_r2" | "gcp_storage" | "azure_storage";
/**
 * A single Cloud Connector rule routing matching traffic directly to a
 * cloud-provider object-storage bucket.
 */
export interface Rule {
    /**
     * The cloud provider hosting the bucket the rule routes traffic to.
     */
    provider: CloudConnectorProvider;
    /**
     * Cloudflare Rules language expression selecting the traffic the rule
     * applies to, e.g. `http.request.uri.path wildcard "/images/*"`.
     */
    expression: string;
    /**
     * Host of the target bucket — e.g. `mybucket.s3.amazonaws.com` for S3,
     * or an R2 bucket's public host. Accepts an `Input` so it can reference
     * another resource's output (commonly an `Bucket`).
     */
    host: string;
    /**
     * Whether the rule is enabled.
     * @default true
     */
    enabled?: boolean;
    /**
     * Informative description of the rule.
     */
    description?: string;
}
export interface RulesProps {
    /**
     * Zone the rules apply to. Stable — changing the zone triggers
     * replacement.
     */
    zoneId: string;
    /**
     * Ordered list of Cloud Connector rules. The whole list is owned by
     * this resource and replaced atomically on every change — rules
     * managed elsewhere in the zone will be overwritten on deploy.
     */
    rules: Rule[];
}
/**
 * A Cloud Connector rule as Cloudflare reports it.
 */
export interface RuleAttribute {
    /** Cloudflare-assigned identifier of the rule. */
    id: string | undefined;
    /** The cloud provider the rule routes traffic to. */
    provider: string;
    /** Rules language expression selecting matching traffic. */
    expression: string;
    /** Host of the target bucket. */
    host: string;
    /** Whether the rule is enabled. */
    enabled: boolean;
    /** Informative description of the rule. */
    description: string | undefined;
}
export interface RulesAttributes {
    /** Zone that owns the rule list. */
    zoneId: string;
    /** The ordered rule list as Cloudflare reports it. */
    rules: RuleAttribute[];
}
export type Rules = Resource<TypeId, RulesProps, RulesAttributes, never, Providers>;
/**
 * The ordered list of Cloud Connector rules for a Cloudflare zone.
 *
 * Cloud Connector routes matching traffic directly from Cloudflare's edge
 * to a cloud-provider object-storage bucket (Cloudflare R2, Amazon S3,
 * Google Cloud Storage, or Azure Blob Storage) without an origin server.
 * Each rule pairs a Rules-language expression with the target bucket host.
 *
 * The zone has exactly one rule list — the API only supports replacing the
 * whole list — so this resource owns it in its entirety (PUT-replace
 * semantics) and there should be at most one `Rules`
 * resource per zone. Destroying the resource clears the list.
 *
 * Safety: when there is no prior state and the zone already has a
 * non-empty rule list, `read` reports it as `Unowned` and the engine
 * refuses to take it over unless `--adopt` (or `adopt(true)`) is set.
 *
 * Note: Cloud Connector only takes effect on proxied (orange-cloud) DNS
 * records, and the number of rules per zone is plan-limited.
 * ### Routing to object storage
 * **Example:** Serve a path prefix from an S3 bucket
 * ```typescript
 * yield* Cloudflare.CloudConnector.Rules("Rules", {
 *   zoneId: zone.zoneId,
 *   rules: [
 *     {
 *       provider: "aws_s3",
 *       expression: 'http.request.uri.path wildcard "/images/*"',
 *       host: "mybucket.s3.amazonaws.com",
 *       description: "serve images from S3",
 *     },
 *   ],
 * });
 * ```
 *
 * **Example:** Serve static assets from an R2 bucket
 * ```typescript
 * const bucket = yield* Cloudflare.R2.Bucket("Assets", {});
 *
 * yield* Cloudflare.CloudConnector.Rules("Rules", {
 *   zoneId: zone.zoneId,
 *   rules: [
 *     {
 *       provider: "cloudflare_r2",
 *       expression: 'http.request.uri.path wildcard "/assets/*"',
 *       // public R2 bucket host (r2.dev or a custom domain)
 *       host: publicBucketHost,
 *       description: "static assets from R2",
 *     },
 *   ],
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/rules/cloud-connector/
 *
 * @resource
 * @product Cloud Connector
 * @category Rules & Configuration
 */
export declare const Rules: import("../../Resource.ts").ResourceClass<Rules>;
/**
 * Returns true if the given value is a Rules resource.
 */
export declare const isRules: (value: unknown) => value is Rules;
export declare const RulesProvider: () => import("effect/Layer").Layer<Provider.Provider<Rules>, never, CloudflareEnvironment | cloudConnector.CloudflareOpContext>;
export {};
//# sourceMappingURL=Rules.d.ts.map