import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
/**
 * Configuration for how the CloudWatch RUM web client collects data from
 * your application's user sessions.
 */
export interface AppMonitorConfiguration {
    /**
     * The ID of the Amazon Cognito identity pool used to authorize the sending
     * of data to RUM.
     */
    identityPoolId?: string;
    /**
     * Pages in your application excluded from RUM data collection. You can't
     * specify both `excludedPages` and `includedPages`.
     */
    excludedPages?: string[];
    /**
     * If your application has pages that RUM should collect data from and
     * others it should not, list the pages to collect here. You can't specify
     * both `excludedPages` and `includedPages`.
     */
    includedPages?: string[];
    /**
     * Pages to be displayed with a "favorite" icon in the CloudWatch RUM
     * console.
     */
    favoritePages?: string[];
    /**
     * The portion of user sessions to sample for RUM data collection, between
     * 0 and 1 (e.g. `0.1` samples 10% of sessions).
     * @default 0.1
     */
    sessionSampleRate?: number;
    /**
     * The ARN of the guest IAM role attached to the Cognito identity pool that
     * authorizes sending data to RUM.
     */
    guestRoleArn?: string;
    /**
     * Whether the RUM web client sets a cookie so that RUM can collect data
     * about user sessions across page views.
     * @default false
     */
    allowCookies?: boolean;
    /**
     * The kinds of telemetry to collect: `"errors"`, `"performance"`, and/or
     * `"http"`.
     */
    telemetries?: ("errors" | "performance" | "http")[];
    /**
     * Whether RUM sends client-side traces to AWS X-Ray for sampled sessions.
     * @default false
     */
    enableXRay?: boolean;
}
export interface AppMonitorProps {
    /**
     * Name of the app monitor. Changing the name replaces the app monitor.
     * @default ${app}-${stage}-${id}
     */
    appMonitorName?: string;
    /**
     * The top-level internet domain name your application has administrative
     * authority over, e.g. `example.com` or `*.example.com`. Specify exactly
     * one of `domain` or `domainList`.
     */
    domain?: string;
    /**
     * List of internet domain names your application has administrative
     * authority over (up to 5). Specify exactly one of `domain` or
     * `domainList`.
     */
    domainList?: string[];
    /**
     * Configuration for how the RUM web client collects session data.
     */
    appMonitorConfiguration?: AppMonitorConfiguration;
    /**
     * Whether the app monitor copies the telemetry data it collects to a
     * CloudWatch Logs log group in your account (retained for 30 days).
     * @default false
     */
    cwLogEnabled?: boolean;
    /**
     * Whether the app monitor accepts custom events sent by the RUM web
     * client.
     * @default "DISABLED"
     */
    customEvents?: "ENABLED" | "DISABLED";
    /**
     * Tags to apply to the app monitor. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface AppMonitor extends Resource<"AWS.RUM.AppMonitor", AppMonitorProps, {
    /**
     * Name of the app monitor.
     */
    appMonitorName: string;
    /**
     * Unique ID of the app monitor (used by the RUM web client configuration).
     */
    appMonitorId: string;
    /**
     * ARN of the app monitor.
     */
    appMonitorArn: string;
}, never, Providers> {
}
/**
 * An Amazon CloudWatch RUM app monitor that collects client-side telemetry
 * (page load times, JavaScript errors, user behavior) from your web
 * application.
 * ### Creating App Monitors
 * **Example:** Monitor a single domain
 * ```typescript
 * import * as RUM from "alchemy/AWS/RUM";
 *
 * const monitor = yield* RUM.AppMonitor("SiteMonitor", {
 *   domain: "example.com",
 * });
 * ```
 *
 * **Example:** Sample all sessions and collect every telemetry type
 * ```typescript
 * const monitor = yield* RUM.AppMonitor("SiteMonitor", {
 *   domain: "*.example.com",
 *   appMonitorConfiguration: {
 *     sessionSampleRate: 1,
 *     telemetries: ["errors", "performance", "http"],
 *     allowCookies: true,
 *   },
 * });
 * ```
 *
 * ### Log Retention and Custom Events
 * **Example:** Copy telemetry to CloudWatch Logs and accept custom events
 * ```typescript
 * const monitor = yield* RUM.AppMonitor("SiteMonitor", {
 *   domainList: ["example.com", "app.example.com"],
 *   cwLogEnabled: true,
 *   customEvents: "ENABLED",
 * });
 * ```
 *
 * @resource
 */
export declare const AppMonitor: import("../../Resource.ts").ResourceClass<AppMonitor>;
declare const RumAppMonitorInvalidDomains_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "RumAppMonitorInvalidDomains";
} & Readonly<A>;
/**
 * Raised when an `AppMonitor` is configured with both or neither of
 * `domain` / `domainList` — the API requires exactly one.
 */
export declare class RumAppMonitorInvalidDomains extends RumAppMonitorInvalidDomains_base<{
    message: string;
}> {
}
export declare const AppMonitorProvider: () => import("effect/Layer").Layer<Provider.Provider<AppMonitor>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=AppMonitor.d.ts.map