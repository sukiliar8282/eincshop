import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
/**
 * One arm of a Cloudflare Access policy rule discriminated union. A rule is a
 * single-key object whose key selects the rule kind (`email`, `emailDomain`,
 * `everyone`, `ip`, etc.) and whose value carries the rule's parameters.
 *
 * Re-exported from `@distilled.cloud/cloudflare/zero-trust`'s
 * `CreateAccessPolicyRequest` so the full Cloudflare rule surface is available
 * without re-declaring the union.
 */
export type PolicyRule = zeroTrust.CreateAccessPolicyRequest["include"][number];
/**
 * One arm of the exclude-side rule union, and its require-side twin.
 * Cloudflare's spec types the exclude/require rule lists separately from
 * include — a few rule kinds (e.g. the GitHub-organization rule) carry the
 * raw wire shape there — so these props use the SDK's own unions rather
 * than reusing {@link PolicyRule}.
 */
export type PolicyExcludeRule = NonNullable<zeroTrust.CreateAccessPolicyRequest["exclude"]>[number];
export type PolicyRequireRule = NonNullable<zeroTrust.CreateAccessPolicyRequest["require"]>[number];
/**
 * Scalar shorthand for rule kinds with a single parameter (and bare names
 * for the parameter-less kinds) — expanded to Cloudflare's wire shape by
 * the providers, so both spellings are equivalent:
 *
 * ```ts
 * include: [{ emailDomain: "example.com" }]   // { emailDomain: { domain: "example.com" } }
 * include: [{ email: "sam@example.com" }]     // { email: { email: "sam@example.com" } }
 * include: ["everyone"]                       // { everyone: {} }
 * require: [{ geo: "US" }]                    // { geo: { countryCode: "US" } }
 * ```
 *
 * Multi-parameter kinds (`gsuite`, `okta`, `saml`, `oidc`, `azureAD`,
 * `githubOrganization`, `externalEvaluation`, `authContext`) keep their
 * wire shape — there is no scalar to collapse them to.
 */
export type PolicyRuleShorthand = "everyone" | "certificate" | "anyValidServiceToken" | {
    email: string;
} | {
    emailDomain: string;
} | {
    emailList: string;
} | {
    ip: string;
} | {
    ipList: string;
} | {
    group: string;
} | {
    loginMethod: string;
} | {
    serviceToken: string;
} | {
    geo: string;
} | {
    authMethod: string;
} | {
    devicePosture: string;
} | {
    commonName: string;
} | {
    linkedAppToken: string;
} | {
    userRiskScore: string;
} | {
    cloudflareAccountMember: string;
};
/** A rule in either spelling: Cloudflare's wire shape or the scalar shorthand. */
export type PolicyRuleInput = PolicyRule | PolicyRuleShorthand;
export type PolicyExcludeRuleInput = PolicyExcludeRule | PolicyRuleShorthand;
export type PolicyRequireRuleInput = PolicyRequireRule | PolicyRuleShorthand;
/**
 * Expand the scalar shorthand to Cloudflare's wire shape; wire-shaped rules
 * pass through untouched.
 */
export declare const normalizePolicyRule: <Rule>(rule: Rule | PolicyRuleShorthand) => Rule;
export declare function normalizePolicyRules<Rule>(rules: ReadonlyArray<Rule | PolicyRuleShorthand>): Rule[];
export declare function normalizePolicyRules<Rule>(rules: ReadonlyArray<Rule | PolicyRuleShorthand> | undefined): Rule[] | undefined;
/**
 * Decision Cloudflare Access takes when a request matches this policy.
 *
 * - `"allow"` — admit the user.
 * - `"deny"` — block the user.
 * - `"non_identity"` — admit without requiring an identity provider login.
 * - `"bypass"` — skip Access entirely.
 */
export type PolicyDecision = "allow" | "deny" | "non_identity" | "bypass" | (string & {});
export type PolicyProps = {
    /**
     * Display name for the policy. Treated as a stable identifier so the
     * provider can locate the policy by name during adoption / state recovery.
     * If omitted, a unique name is generated from the stack/stage/logical id.
     *
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * Decision the policy enforces when its rules match. Changing the decision
     * triggers replacement.
     */
    decision: PolicyDecision;
    /**
     * Rules combined with logical OR. A request must satisfy at least one
     * include rule for the policy to match. Required and must be non-empty.
     */
    include: PolicyRuleInput[];
    /**
     * Rules combined with logical NOT. A request matching any exclude rule is
     * rejected by the policy even if it satisfied an include rule.
     */
    exclude?: PolicyExcludeRuleInput[];
    /**
     * Rules combined with logical AND. A request must satisfy every require
     * rule in addition to an include rule.
     */
    require?: PolicyRequireRuleInput[];
    /**
     * Duration of issued session tokens. Format: `300ms`, `2h45m`, etc. When
     * unset, applications using this policy fall back to their own configured
     * session duration.
     */
    sessionDuration?: string;
    /**
     * When true, Access requires an administrator to approve each authentication
     * request before the user is admitted.
     *
     * @default false
     */
    approvalRequired?: boolean;
    /**
     * When true, users must enter a justification when logging in to any
     * application that consumes this policy.
     *
     * @default false
     */
    purposeJustificationRequired?: boolean;
    /**
     * Adopt an existing reusable policy with the same name when the engine has
     * no prior state for this logical id.
     *
     * @default false
     */
    adopt?: boolean;
};
export declare namespace Policy {
    /**
     * A single Access policy rule. See {@link PolicyRule} for the full
     * discriminated union (email, emailDomain, everyone, ip, ipList, group,
     * gsuite, githubOrganization, okta, azureAD, saml, oidc, deviceCheck via
     * `devicePosture`, externalEvaluation, etc.).
     */
    type RuleGroup = PolicyRuleInput;
}
export type Policy = Resource<"Cloudflare.Access.Policy", PolicyProps, {
    /** UUID of the policy assigned by Cloudflare. */
    policyId: string;
    /** Display name reported by Cloudflare. */
    name: string;
    /** Decision the policy enforces. */
    decision: string;
    /** Cloudflare account that owns the policy. */
    accountId: string;
    /** Creation timestamp reported by Cloudflare, when available. */
    createdAt: string | undefined;
    /** Last-modified timestamp reported by Cloudflare, when available. */
    updatedAt: string | undefined;
}, never, Providers>;
/**
 * A reusable, account-scoped Cloudflare Access policy. Distinct from the
 * inline policies attached directly to an `Application` — a reusable
 * policy can be referenced by multiple applications by id.
 * ### Creating a Policy
 * **Example:** Allow a single email domain
 * ```typescript
 * const policy = yield* Cloudflare.Access.Policy("AllowExampleDomain", {
 *   decision: "allow",
 *   include: [{ emailDomain: { domain: "example.com" } }],
 * });
 * ```
 *
 * **Example:** Allow everyone but require purpose justification
 * ```typescript
 * const policy = yield* Cloudflare.Access.Policy("OpenWithJustification", {
 *   decision: "allow",
 *   include: [{ everyone: {} }],
 *   purposeJustificationRequired: true,
 *   sessionDuration: "12h",
 * });
 * ```
 *
 * ### Combining rule groups
 * **Example:** Include + exclude + require
 * ```typescript
 * const policy = yield* Cloudflare.Access.Policy("EngineersExceptInterns", {
 *   decision: "allow",
 *   include: [{ emailDomain: { domain: "example.com" } }],
 *   exclude: [{ email: { email: "intern@example.com" } }],
 *   require: [{ geo: { countryCode: "US" } }],
 * });
 * ```
 *
 * @resource
 * @product Access
 * @category Cloudflare One (Zero Trust)
 */
export declare const Policy: import("../../Resource.ts").ResourceClass<Policy>;
export declare const PolicyProvider: () => import("effect/Layer").Layer<Provider.Provider<Policy>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | zeroTrust.CloudflareOpContext>;
//# sourceMappingURL=Policy.d.ts.map