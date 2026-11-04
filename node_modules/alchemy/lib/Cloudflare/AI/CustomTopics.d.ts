import * as aiSecurity from "@distilled.cloud/cloudflare/ai-security";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.AI.Security.CustomTopics";
type TypeId = typeof TypeId;
/**
 * A custom topic category for AI Security for Apps content detection.
 */
export type Topic = {
    /**
     * Human-readable label for the topic category.
     */
    label: string;
    /**
     * The topic description used to classify AI (LLM) traffic content.
     */
    topic: string;
};
export type CustomTopicsProps = {
    /**
     * Zone the custom topics belong to. Stable — changing the zone
     * triggers a replacement (the old zone's topic list is restored to
     * the value it had before Alchemy managed it).
     */
    zoneId: string;
    /**
     * The full list of custom topic categories. Mutable — the PUT
     * replaces the entire list, so reconcile syncs the list as a whole.
     */
    topics: Topic[];
};
export type CustomTopicsAttributes = {
    /** Zone the custom topics belong to. */
    zoneId: string;
    /** The custom topic categories currently configured on the zone. */
    topics: Topic[];
    /**
     * The topic list the zone had before Alchemy first managed it.
     * Restored on destroy, so deleting the resource puts the zone back
     * the way it was found.
     */
    initialTopics: Topic[];
};
export type CustomTopics = Resource<TypeId, CustomTopicsProps, CustomTopicsAttributes, never, Providers>;
/**
 * Custom topic categories for AI Security for Apps (Firewall for AI)
 * content detection on a Cloudflare zone
 * (`/zones/{zone_id}/ai-security/custom-topics`).
 *
 * The topic list is a zone singleton — it always exists (defaulting to
 * empty) and is never created or deleted, only replaced wholesale via
 * PUT. Reconcile PUTs the desired list when the observed list differs;
 * destroy restores the list the zone had before Alchemy first managed it.
 *
 * Declare at most one `CustomTopics` per zone — two instances
 * managing the same zone would fight over the single underlying list.
 *
 * AI Security for Apps is entitlement-gated: on accounts without the
 * feature every call fails with the typed `AiSecurityNotEntitled` error
 * (Cloudflare error code 13101).
 * ### Managing custom topics
 * **Example:** Classify traffic into two custom topics
 * ```typescript
 * const topics = yield* Cloudflare.AI.CustomTopics("Topics", {
 *   zoneId: zone.zoneId,
 *   topics: [
 *     { label: "billing", topic: "Questions about invoices and payments" },
 *     { label: "abuse", topic: "Harassment or abusive language" },
 *   ],
 * });
 * ```
 *
 * **Example:** Clear all custom topics
 * ```typescript
 * yield* Cloudflare.AI.CustomTopics("Topics", {
 *   zoneId: zone.zoneId,
 *   topics: [],
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/waf/detections/firewall-for-ai/
 *
 * @resource
 * @product AI Security
 * @category Application Security
 */
export declare const CustomTopics: import("../../Resource.ts").ResourceClass<CustomTopics>;
/**
 * Returns true if the given value is a CustomTopics resource.
 */
export declare const isCustomTopics: (value: unknown) => value is CustomTopics;
export declare const CustomTopicsProvider: () => import("effect/Layer").Layer<Provider.Provider<CustomTopics>, never, CloudflareEnvironment | aiSecurity.CloudflareOpContext>;
export {};
//# sourceMappingURL=CustomTopics.d.ts.map