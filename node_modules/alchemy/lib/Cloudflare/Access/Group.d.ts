import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
/**
 * One arm of a Cloudflare Access group rule discriminated union. A rule is a
 * single-key object whose key selects the rule kind (`email`, `emailDomain`,
 * `everyone`, `ip`, `geo`, `serviceToken`, etc.) and whose value carries the
 * rule's parameters.
 *
 * Re-exported from `@distilled.cloud/cloudflare/zero-trust`'s
 * `CreateAccessGroupForAccountRequest` so the full Cloudflare rule surface is
 * available without re-declaring the union.
 */
export type GroupRule = zeroTrust.CreateAccessGroupForAccountRequest["include"][number];
/**
 * One arm of the exclude-side rule union, and its require-side twin.
 * Cloudflare's spec types the exclude/require rule lists separately from
 * include — a few rule kinds (e.g. the GitHub-organization rule) carry the
 * raw wire shape there — so these props use the SDK's own unions rather
 * than reusing {@link GroupRule}.
 */
export type GroupExcludeRule = NonNullable<zeroTrust.CreateAccessGroupForAccountRequest["exclude"]>[number];
export type GroupRequireRule = NonNullable<zeroTrust.CreateAccessGroupForAccountRequest["require"]>[number];
export type GroupProps = {
    /**
     * Display name for the group. Used as a stable identifier so the provider
     * can locate the group by name during adoption / state recovery. If
     * omitted, a unique name is generated from the stack/stage/logical id.
     *
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * Rules combined with logical OR. A user needs to meet only one of the
     * Include rules to match the group. Required and must be non-empty.
     */
    include: GroupRule[];
    /**
     * Rules combined with logical NOT. A user matching any Exclude rule does
     * not match the group, even if they satisfied an Include rule.
     */
    exclude?: GroupExcludeRule[];
    /**
     * Rules combined with logical AND. A user must satisfy every Require rule
     * in addition to an Include rule.
     */
    require?: GroupRequireRule[];
    /**
     * Whether this is the default group for the Zero Trust organization.
     *
     * @default false
     */
    isDefault?: boolean;
};
export type Group = Resource<"Cloudflare.Access.Group", GroupProps, {
    /** UUID of the group assigned by Cloudflare. */
    groupId: string;
    /** Cloudflare account that owns the group. */
    accountId: string;
    /** Display name reported by Cloudflare. */
    name: string;
    /** Whether Cloudflare reports this group as the organization default. */
    isDefault: boolean | undefined;
}, never, Providers>;
/**
 * A Cloudflare Zero Trust Access group — a reusable, account-scoped set of
 * Access rule criteria. Groups are referenced from Access policies via a
 * `{ group: { id } }` rule, letting many policies share one membership
 * definition.
 * ### Creating a Group
 * **Example:** Allow a single email domain
 * ```typescript
 * const group = yield* Cloudflare.Access.Group("ExampleDomain", {
 *   include: [{ emailDomain: { domain: "example.com" } }],
 * });
 * ```
 *
 * **Example:** Combine include, exclude and require rules
 * ```typescript
 * const group = yield* Cloudflare.Access.Group("UsEngineers", {
 *   include: [{ emailDomain: { domain: "example.com" } }],
 *   exclude: [{ email: { email: "intern@example.com" } }],
 *   require: [{ geo: { countryCode: "US" } }],
 * });
 * ```
 *
 * ### Referencing a Group from a Policy
 * **Example:** Allow members of the group
 * ```typescript
 * const group = yield* Cloudflare.Access.Group("Team", {
 *   include: [{ emailDomain: { domain: "example.com" } }],
 * });
 *
 * const policy = yield* Cloudflare.Access.Policy("AllowTeam", {
 *   decision: "allow",
 *   include: [{ group: { id: group.groupId } }],
 * });
 * ```
 *
 * @resource
 * @product Access
 * @category Cloudflare One (Zero Trust)
 */
export declare const Group: import("../../Resource.ts").ResourceClass<Group>;
export declare const isGroup: (value: unknown) => value is Group;
export declare const GroupProvider: () => import("effect/Layer").Layer<Provider.Provider<Group>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | zeroTrust.CloudflareOpContext>;
//# sourceMappingURL=Group.d.ts.map