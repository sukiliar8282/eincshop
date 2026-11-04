import * as tokenValidation from "@distilled.cloud/cloudflare/token-validation";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.TokenValidation.Rule";
type TypeId = typeof TypeId;
/**
 * Action applied to requests that match the selector and fail the rule's
 * expression.
 */
export type RuleAction = "log" | "block";
/**
 * Selects the operations covered by a token validation rule.
 */
export interface RuleSelector {
    /**
     * Operations to include, by host.
     */
    include?: {
        /** Hostnames whose operations the rule covers. */
        host?: string[];
    }[];
    /**
     * Operations to exclude, by API Shield operation ID.
     */
    exclude?: {
        /** API Shield operation IDs the rule must not cover. */
        operationIds?: string[];
    }[];
}
/**
 * Desired ordering of a rule among the zone's token validation rules.
 * Applied via PATCH whenever set; ordering is not tracked in attributes.
 */
export type RulePosition = {
    index: number;
} | {
    before: string;
} | {
    after: string;
};
export interface RuleProps {
    /**
     * Zone the rule applies to.
     *
     * Stable — moving a rule between zones triggers a replacement.
     */
    zoneId: string;
    /**
     * Human-readable name for the rule. If omitted, a unique name is
     * generated from the app, stage, and logical ID.
     * @default ${app}-${stage}-${id}
     */
    title?: string;
    /**
     * A description that gives more details than `title`.
     * @default ""
     */
    description?: string;
    /**
     * Toggle the rule on or off.
     * @default true
     */
    enabled?: boolean;
    /**
     * Action to take on requests that match the selector and fail the
     * expression: `log` or `block`.
     */
    action: RuleAction;
    /**
     * Rule expression — requests that fail it are subject to `action`,
     * e.g. `is_jwt_valid("<configId>")`. Reference a
     * {@link TokenConfiguration} by interpolating its `configId` output.
     */
    expression: string;
    /**
     * Which operations the rule covers (include by host, exclude by API
     * Shield operation ID).
     */
    selector: RuleSelector;
    /**
     * Desired ordering among the zone's rules. Applied via PATCH on every
     * deploy it is set; omit to leave ordering untouched (new rules append).
     */
    position?: RulePosition;
}
export interface RuleAttributes {
    /** Cloudflare-assigned UUID of the rule. */
    ruleId: string;
    /** Zone the rule belongs to. */
    zoneId: string;
    /** Human-readable name of the rule. */
    title: string;
    /** Description of the rule. */
    description: string;
    /** Whether the rule is enabled. */
    enabled: boolean;
    /** Action applied to matching requests that fail the expression. */
    action: RuleAction;
    /** The rule's expression. */
    expression: string;
    /** Which operations the rule covers. */
    selector: {
        include?: {
            host?: string[];
        }[];
        exclude?: {
            operationIds?: string[];
        }[];
    };
    /** ISO8601 creation timestamp, when reported by the API. */
    createdAt: string | undefined;
    /** ISO8601 last-modified timestamp, when reported by the API. */
    lastUpdated: string | undefined;
}
export type Rule = Resource<TypeId, RuleProps, RuleAttributes, never, Providers>;
/**
 * An API Shield JWT validation rule — selects operations/hosts on a zone
 * and enforces a token validation expression with a `log` or `block`
 * action.
 *
 * A rule references a {@link TokenConfiguration} by UUID inside its
 * `expression` (e.g. `is_jwt_valid("<configId>")`). Keep the rule
 * depending on the configuration through its output so destroy order is
 * rule first, configuration second.
 *
 * JWT validation is an API Shield feature (Enterprise add-on) — accounts
 * without the entitlement receive the typed `TokenValidationNotEntitled`
 * error (Cloudflare code 10403) on every call.
 *
 * All fields are patched in place; only `zoneId` forces a replacement.
 * ### Creating a Rule
 * **Example:** Log requests with invalid JWTs
 * ```typescript
 * const rule = yield* Cloudflare.TokenValidation.Rule("LogInvalidJwt", {
 *   zoneId: zone.zoneId,
 *   action: "log",
 *   expression: Output.interpolate`is_jwt_valid("${config.configId}")`,
 *   selector: { include: [{ host: ["api.example.com"] }] },
 * });
 * ```
 *
 * **Example:** Block invalid JWTs, excluding a public operation
 * ```typescript
 * yield* Cloudflare.TokenValidation.Rule("BlockInvalidJwt", {
 *   zoneId: zone.zoneId,
 *   action: "block",
 *   expression: Output.interpolate`is_jwt_valid("${config.configId}")`,
 *   selector: {
 *     include: [{ host: ["api.example.com"] }],
 *     exclude: [{ operationIds: [healthCheck.operationId] }],
 *   },
 * });
 * ```
 *
 * ### Updating a Rule
 * **Example:** Disable a rule in place
 * ```typescript
 * yield* Cloudflare.TokenValidation.Rule("BlockInvalidJwt", {
 *   zoneId: zone.zoneId,
 *   enabled: false,
 *   action: "block",
 *   expression: Output.interpolate`is_jwt_valid("${config.configId}")`,
 *   selector: { include: [{ host: ["api.example.com"] }] },
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/api-shield/security/jwt-validation/
 *
 * @resource
 * @product Token Validation
 * @category Application Security
 */
export declare const Rule: import("../../Resource.ts").ResourceClass<Rule>;
/**
 * Returns true if the given value is a Rule resource.
 */
export declare const isRule: (value: unknown) => value is Rule;
export declare const RuleProvider: () => import("effect/Layer").Layer<Provider.Provider<Rule>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | tokenValidation.CloudflareOpContext>;
export {};
//# sourceMappingURL=Rule.d.ts.map