import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Gateway.List";
type TypeId = typeof TypeId;
/**
 * The kind of values a Gateway list holds. Immutable — changing the type
 * triggers a replacement.
 */
export type ListType = "SERIAL" | "URL" | "DOMAIN" | "EMAIL" | "IP" | "CATEGORY" | "LOCATION" | "DEVICE" | "AAGUID";
/**
 * A single entry in a Gateway list.
 */
export interface ListItem {
    /**
     * The item's value — a domain, URL, IP, email, serial number, etc.
     * depending on the list's `type`.
     */
    value: string;
    /**
     * Optional free-form description of the item.
     */
    description?: string;
}
export interface ListProps {
    /**
     * Display name for the list. Used as a stable identifier so the provider
     * can locate the list by name during adoption / state recovery. If
     * omitted, a unique name is generated from the app, stage, and logical ID.
     *
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * The kind of values the list holds (DOMAIN, IP, URL, EMAIL, SERIAL,
     * CATEGORY, LOCATION, DEVICE, AAGUID). Immutable — changing the type
     * triggers a replacement.
     */
    type: ListType;
    /**
     * Free-form description of the list. Mutable.
     *
     * @default ""
     */
    description?: string;
    /**
     * Entries in the list. Reconciled as a full set via PUT — items present
     * here and missing in the cloud are added; extra cloud items are removed.
     *
     * @default []
     */
    items?: ListItem[];
}
export interface ListAttributes {
    /** UUID of the list, assigned by Cloudflare. */
    listId: string;
    /** Cloudflare account that owns the list. */
    accountId: string;
    /** Display name of the list. */
    name: string;
    /** The kind of values the list holds. */
    type: ListType;
    /** Description of the list. */
    description: string;
    /** Current entries in the list. */
    items: ListItem[];
    /** Number of entries in the list. */
    count: number;
    /** ISO8601 creation timestamp. */
    createdAt: string | undefined;
    /** ISO8601 last-update timestamp. */
    updatedAt: string | undefined;
}
export type List = Resource<TypeId, ListProps, ListAttributes, never, Providers>;
/**
 * A Cloudflare Zero Trust Gateway list — a named set of domains, IPs,
 * URLs, emails, serial numbers, or device IDs referenced from Gateway
 * rule wirefilter expressions by UUID (`$<listId>`).
 *
 * The list's `type` is immutable (changing it replaces the list); name,
 * description, and items all converge in place. Items are managed as a
 * full set — the provider PUTs the complete desired item set and removes
 * anything not declared.
 * ### Creating a List
 * **Example:** Domain list
 * ```typescript
 * const blocked = yield* Cloudflare.Gateway.List("BlockedDomains", {
 *   type: "DOMAIN",
 *   description: "domains blocked org-wide",
 *   items: [
 *     { value: "badsite.example.com" },
 *     { value: "malware.example.net", description: "known C2" },
 *   ],
 * });
 * ```
 *
 * **Example:** IP list
 * ```typescript
 * const egress = yield* Cloudflare.Gateway.List("OfficeEgress", {
 *   type: "IP",
 *   items: [{ value: "203.0.113.0/24" }],
 * });
 * ```
 *
 * ### Referencing from a Gateway Rule
 * **Example:** Block DNS lookups for every domain in the list
 * ```typescript
 * yield* Cloudflare.Gateway.Rule("BlockListedDomains", {
 *   action: "block",
 *   filters: ["dns"],
 *   traffic: `any(dns.domains[*] in $${blocked.listId})`,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/cloudflare-one/policies/gateway/lists/
 *
 * @resource
 * @product Gateway
 * @category Cloudflare One (Zero Trust)
 */
export declare const List: import("../../Resource.ts").ResourceClass<List>;
/**
 * Returns true if the given value is a List resource.
 */
export declare const isList: (value: unknown) => value is List;
export declare const ListProvider: () => import("effect/Layer").Layer<Provider.Provider<List>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | zeroTrust.CloudflareOpContext>;
export {};
//# sourceMappingURL=List.d.ts.map