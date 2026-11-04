import * as emailRouting from "@distilled.cloud/cloudflare/email-routing";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
import { type Reference } from "../Zone/index.ts";
export type Matcher = {
    type: "all";
} | {
    type: "literal";
    field: "to";
    value: string;
};
export type Action = {
    type: "drop";
} | {
    type: "forward";
    value: string[];
} | {
    type: "worker";
    value: string[];
};
export type RuleProps = {
    /**
     * Zone the rule lives on.
     */
    zone: Reference;
    /**
     * Display name for the rule.
     */
    name?: string;
    /**
     * Whether the rule is active. Disabled rules are evaluated last and
     * effectively skipped.
     *
     * @default true
     */
    enabled?: boolean;
    /**
     * Lower priority numbers run first.
     *
     * @default 0
     */
    priority?: number;
    /**
     * Matchers that define which inbound emails trigger this rule.
     */
    matchers: Matcher[];
    /**
     * Actions to take for matched emails.
     */
    actions: Action[];
};
export type Rule = Resource<"Cloudflare.Email.Rule", RuleProps, {
    ruleId: string;
    zoneId: string;
    name: string;
    enabled: boolean;
    priority: number;
    matchers: Matcher[];
    actions: Action[];
}, never, Providers>;
/**
 * A Cloudflare Email Routing rule.
 *
 * Rules forward inbound mail matching `matchers` to the listed actions
 * (forward to a verified destination, drop, or hand off to a Worker).
 * ### Forwarding Mail
 * **Example:** Forward `info@` to a verified destination
 * ```typescript
 * const rule = yield* Cloudflare.Email.Rule("InfoForward", {
 *   zone: "example.com",
 *   matchers: [{ type: "literal", field: "to", value: "info@example.com" }],
 *   actions: [{ type: "forward", value: ["ops@example.com"] }],
 * });
 * ```
 *
 * @resource
 * @product Email
 * @category Email
 */
export declare const Rule: import("../../Resource.ts").ResourceClass<Rule>;
export declare const RuleProvider: () => import("effect/Layer").Layer<Provider.Provider<Rule>, never, CloudflareEnvironment | emailRouting.CloudflareOpContext>;
//# sourceMappingURL=Rule.d.ts.map