import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Gateway.Logging";
type TypeId = typeof TypeId;
/**
 * Per-rule-type logging toggles.
 */
export interface LoggingRuleSettings {
    /** Log all requests of this type, regardless of rule matches. */
    logAll?: boolean;
    /** Log only requests blocked by a rule. */
    logBlocks?: boolean;
}
/**
 * A snapshot of the account's Gateway logging settings as observed on
 * Cloudflare. Captured before Alchemy first writes the singleton and
 * restored on destroy.
 */
export interface LoggingSnapshot {
    /** Whether PII is redacted from activity logs. */
    redactPii?: boolean;
    /** Logging settings for DNS queries. */
    dns?: LoggingRuleSettings;
    /** Logging settings for HTTP requests. */
    http?: LoggingRuleSettings;
    /** Logging settings for layer-4 (network) sessions. */
    l4?: LoggingRuleSettings;
}
export interface LoggingProps {
    /**
     * Redact personally identifiable information from activity logging
     * (PII fields include source IP, user email, user ID, device ID, URL,
     * referrer, and user agent).
     */
    redactPii?: boolean;
    /**
     * Logging settings per rule type. Only the rule types (and fields) you
     * declare are converged; everything else keeps its current value.
     */
    settingsByRuleType?: {
        /** Logging settings for DNS queries. */
        dns?: LoggingRuleSettings;
        /** Logging settings for HTTP requests. */
        http?: LoggingRuleSettings;
        /** Logging settings for layer-4 (network) sessions. */
        l4?: LoggingRuleSettings;
    };
}
export type LoggingAttributes = LoggingSnapshot & {
    /** Account that owns the Gateway logging singleton. */
    accountId: string;
    /**
     * The logging settings the account had before Alchemy first wrote
     * them. Restored (via PUT) on destroy, so deleting the resource puts
     * the account back the way it was found.
     */
    initialSettings: LoggingSnapshot;
};
export type Logging = Resource<TypeId, LoggingProps, LoggingAttributes, never, Providers>;
/**
 * Manages the **singleton** Cloudflare Zero Trust **Gateway logging
 * settings** for an account (`/accounts/{accountId}/gateway/logging`) —
 * PII redaction and per-rule-type (DNS / HTTP / L4) activity-log toggles.
 *
 * The singleton always exists, so reconcile converges only the fields you
 * declare (merging them over the observed state before the PUT, since the
 * API is PUT-only). The pre-management snapshot is captured on first touch
 * and restored on destroy (capture-and-restore).
 * ### Managing logging settings
 * **Example:** Log everything, keep PII
 * ```typescript
 * yield* Cloudflare.Gateway.Logging("Logging", {
 *   redactPii: false,
 *   settingsByRuleType: {
 *     dns: { logAll: true, logBlocks: true },
 *     http: { logAll: true, logBlocks: true },
 *     l4: { logAll: true, logBlocks: true },
 *   },
 * });
 * ```
 *
 * **Example:** Only log blocked DNS queries, redacting PII
 * ```typescript
 * yield* Cloudflare.Gateway.Logging("Logging", {
 *   redactPii: true,
 *   settingsByRuleType: {
 *     dns: { logAll: false, logBlocks: true },
 *   },
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/cloudflare-one/insights/logs/gateway-logs/
 *
 * @resource
 * @product Gateway
 * @category Cloudflare One (Zero Trust)
 */
export declare const Logging: import("../../Resource.ts").ResourceClass<Logging>;
/**
 * Returns true if the given value is a Logging resource.
 */
export declare const isLogging: (value: unknown) => value is Logging;
export declare const LoggingProvider: () => import("effect/Layer").Layer<Provider.Provider<Logging>, never, CloudflareEnvironment | zeroTrust.CloudflareOpContext>;
export {};
//# sourceMappingURL=Logging.d.ts.map