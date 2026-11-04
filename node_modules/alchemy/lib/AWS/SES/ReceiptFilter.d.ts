import * as ses from "@distilled.cloud/aws/ses";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * Whether the filter permits (`Allow`) or blocks (`Block`) mail from the
 * matching IP range.
 */
export type ReceiptFilterPolicy = ses.ReceiptFilterPolicy;
export interface ReceiptIpFilter {
    /**
     * Whether to allow or block mail from the CIDR range.
     */
    policy: ReceiptFilterPolicy;
    /**
     * A single IPv4 address (e.g. `1.2.3.4`) or CIDR range (e.g. `1.2.3.0/24`)
     * the filter applies to.
     */
    cidr: string;
}
export interface ReceiptFilterProps {
    /**
     * Name of the IP address filter. May contain letters, numbers, dashes and
     * underscores, up to 64 characters, and must start and end with a letter or
     * number. If omitted, a deterministic physical name is generated from the
     * app, stage, and logical ID. Changing the name replaces the filter.
     */
    filterName?: string;
    /**
     * The IP filtering rule — an allow or block decision for a CIDR range.
     * Changing it replaces the filter (SES has no update operation for filters).
     */
    ipFilter: ReceiptIpFilter;
}
export interface ReceiptFilter extends Resource<"AWS.SES.ReceiptFilter", ReceiptFilterProps, {
    /** Name of the IP address filter. */
    filterName: string;
}, never, Providers> {
}
/**
 * An Amazon SES receipt IP address filter — an account-level allow/block rule
 * for the source IP of inbound mail. Block filters take precedence over allow
 * filters.
 *
 * Filters are immutable: there is no update API, so any change to the name or
 * the IP rule replaces the filter.
 * ### Creating Filters
 * **Example:** Block a CIDR Range
 * ```typescript
 * import * as SES from "alchemy/AWS/SES";
 *
 * const filter = yield* SES.ReceiptFilter("BlockBadActors", {
 *   ipFilter: { policy: "Block", cidr: "10.0.0.0/24" },
 * });
 * ```
 *
 * **Example:** Allow a Single Address
 * ```typescript
 * const filter = yield* SES.ReceiptFilter("AllowPartner", {
 *   ipFilter: { policy: "Allow", cidr: "192.0.2.10" },
 * });
 * ```
 *
 * @resource
 */
export declare const ReceiptFilter: import("../../Resource.ts").ResourceClass<ReceiptFilter>;
export declare const ReceiptFilterProvider: () => import("effect/Layer").Layer<Provider.Provider<ReceiptFilter>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ReceiptFilter.d.ts.map