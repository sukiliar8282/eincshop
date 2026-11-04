import * as rules from "@distilled.cloud/cloudflare/rules";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Rules.List";
type TypeId = typeof TypeId;
/**
 * The type of a list. Each kind supports specific list items: IP addresses,
 * ASNs, hostnames, or URL redirects. Cannot be changed after creation.
 */
export type ListKind = "ip" | "asn" | "hostname" | "redirect";
/**
 * An item in an `ip` list — an IPv4/IPv6 address or CIDR range
 * (IPv4 prefixes /8–/32, IPv6 prefixes /4–/64).
 */
export type ListIpItem = {
    /**
     * An IPv4 address, IPv4 CIDR, IPv6 address, or IPv6 CIDR.
     */
    ip: string;
    /**
     * An informative summary of the item.
     */
    comment?: string;
};
/**
 * An item in an `asn` list — an autonomous system number.
 */
export type ListAsnItem = {
    /**
     * A non-negative 32 bit integer.
     */
    asn: number;
    /**
     * An informative summary of the item.
     */
    comment?: string;
};
/**
 * An item in a `hostname` list.
 */
export type ListHostnameItem = {
    /**
     * Valid characters for hostnames are ASCII(7) letters from a to z, the
     * digits from 0 to 9, wildcards (*), and the hyphen (-).
     */
    hostname: {
        /**
         * The hostname to match, e.g. `example.com` or `*.example.com`.
         */
        urlHostname: string;
        /**
         * Only applies to wildcard hostnames (e.g., *.example.com). When `true`,
         * only subdomains are blocked. When `false`, both the root domain and
         * subdomains are blocked.
         * @default false
         */
        excludeExactHostname?: boolean;
    };
    /**
     * An informative summary of the item.
     */
    comment?: string;
};
/**
 * An item in a `redirect` list — a source/target URL pair used by Bulk
 * Redirect rules.
 */
export type ListRedirectItem = {
    /**
     * The definition of the redirect.
     */
    redirect: {
        /**
         * The source URL to match, e.g. `example.com/old-path`.
         */
        sourceUrl: string;
        /**
         * The URL to redirect to.
         */
        targetUrl: string;
        /**
         * Whether the redirect also matches subdomains of the source URL.
         * @default false
         */
        includeSubdomains?: boolean;
        /**
         * Whether the redirect target URL keeps the path suffix of the request.
         * @default false
         */
        preservePathSuffix?: boolean;
        /**
         * Whether the redirect target URL keeps the query string of the request.
         * @default false
         */
        preserveQueryString?: boolean;
        /**
         * The HTTP status code used for the redirect.
         * @default 301
         */
        statusCode?: 301 | 302 | 307 | 308;
        /**
         * Whether the redirect also matches subpaths of the source URL.
         * @default false
         */
        subpathMatching?: boolean;
    };
    /**
     * An informative summary of the item.
     */
    comment?: string;
};
/**
 * An item in an account list. The shape must match the list `kind`:
 * `{ ip }` for `ip` lists, `{ asn }` for `asn` lists, `{ hostname }` for
 * `hostname` lists, and `{ redirect }` for `redirect` lists.
 */
export type ListItem = ListIpItem | ListAsnItem | ListHostnameItem | ListRedirectItem;
export type ListProps = {
    /**
     * An informative name for the list, used in filter and rule expressions
     * (e.g. `ip.src in $my_list`). Must contain only letters, numbers, and
     * underscores (max 50 characters). If omitted, a unique name is generated
     * from the app, stage, and logical ID. Cannot be changed after creation —
     * updating this property triggers a replacement.
     * @default ${app}_${stage}_${id}
     */
    name?: string;
    /**
     * The type of the list. Each kind supports specific list items
     * (IP addresses, ASNs, hostnames, or redirects). Cannot be changed after
     * creation — updating this property triggers a replacement.
     */
    kind: ListKind;
    /**
     * An informative summary of the list.
     */
    description?: string;
    /**
     * The full contents of the list. Items are replaced idempotently via the
     * bulk items operation: the provider diffs the observed items against this
     * desired set and, on any delta, replaces the entire list contents and
     * polls the asynchronous bulk operation to completion.
     * @default []
     */
    items?: ListItem[];
};
export type ListAttributes = {
    /**
     * The unique ID of the list.
     */
    listId: string;
    /**
     * The Cloudflare account the list belongs to.
     */
    accountId: string;
    /**
     * The name of the list, usable in rule expressions as `$name`.
     */
    name: string;
    /**
     * The type of the list.
     */
    kind: ListKind;
    /**
     * An informative summary of the list.
     */
    description: string | undefined;
    /**
     * The number of items in the list.
     */
    numItems: number;
    /**
     * The number of filters referencing the list.
     */
    numReferencingFilters: number;
    /**
     * The RFC 3339 timestamp of when the list was created.
     */
    createdOn: string;
    /**
     * The RFC 3339 timestamp of when the list was last modified.
     */
    modifiedOn: string;
};
export type List = Resource<TypeId, ListProps, ListAttributes, never, Providers>;
/**
 * A Cloudflare account-level List (Lists API) — a named collection of IP
 * addresses, ASNs, hostnames, or URL redirects referenced from ruleset
 * expressions (`ip.src in $my_list`) and Bulk Redirect rules.
 *
 * `name` and `kind` are immutable and changing either triggers a
 * replacement. The list's items are managed as part of the resource: on any
 * change the full contents are replaced via the asynchronous bulk items
 * operation, which the provider polls to completion.
 * ### Creating a List
 * **Example:** IP list with items
 * ```typescript
 * const blocklist = yield* Cloudflare.Rules.List("blocklist", {
 *   kind: "ip",
 *   description: "Known bad actors",
 *   items: [
 *     { ip: "203.0.113.7", comment: "scanner" },
 *     { ip: "198.51.100.0/24" },
 *   ],
 * });
 * ```
 *
 * **Example:** ASN list with an explicit name
 * ```typescript
 * const asns = yield* Cloudflare.Rules.List("bad-asns", {
 *   name: "bad_asns",
 *   kind: "asn",
 *   items: [{ asn: 64496 }, { asn: 64511, comment: "spam network" }],
 * });
 * ```
 *
 * **Example:** Redirect list for Bulk Redirects
 * ```typescript
 * const redirects = yield* Cloudflare.Rules.List("redirects", {
 *   kind: "redirect",
 *   items: [
 *     {
 *       redirect: {
 *         sourceUrl: "example.com/old",
 *         targetUrl: "https://example.com/new",
 *         statusCode: 301,
 *       },
 *     },
 *   ],
 * });
 * ```
 *
 * ### Referencing a List from rules
 * **Example:** Use the list name in a Ruleset expression
 * ```typescript
 * const list = yield* Cloudflare.Rules.List("blocklist", { kind: "ip" });
 *
 * // The stable `name` attribute interpolates into rule expressions:
 * // `ip.src in $<name>`
 * const expression = list.name.apply((name) => `ip.src in $${name}`);
 * ```
 *
 * @see https://developers.cloudflare.com/waf/tools/lists/
 *
 * @resource
 * @product Rules
 * @category Rules & Configuration
 */
export declare const List: import("../../Resource.ts").ResourceClass<List>;
/**
 * Returns true if the given value is a List resource.
 */
export declare const isList: (value: unknown) => value is List;
declare const ListBulkOperationError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "ListBulkOperationError";
} & Readonly<A>;
/**
 * The asynchronous bulk items operation finished in a non-`completed`
 * state (or never completed within the polling budget).
 */
export declare class ListBulkOperationError extends ListBulkOperationError_base<{
    readonly operationId: string;
    readonly status: string;
    readonly message?: string;
}> {
}
export declare const ListProvider: () => import("effect/Layer").Layer<Provider.Provider<List>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | rules.CloudflareOpContext>;
export {};
//# sourceMappingURL=List.d.ts.map