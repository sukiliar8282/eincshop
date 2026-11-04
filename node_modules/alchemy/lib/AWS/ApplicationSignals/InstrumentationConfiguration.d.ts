import * as appsignals from "@distilled.cloud/aws/application-signals";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface InstrumentationConfigurationProps {
    /**
     * The kind of dynamic instrumentation: `PROBE` or `BREAKPOINT`.
     * Configurations are immutable — changing the type replaces the
     * configuration.
     */
    instrumentationType: appsignals.InstrumentationType;
    /**
     * Name of the Application Signals service the instrumented code belongs
     * to. Changing it replaces the configuration.
     */
    service: string;
    /**
     * The service's environment (e.g. `eks:prod`, `lambda:default`).
     * Changing it replaces the configuration.
     */
    environment: string;
    /**
     * The signal produced by the instrumentation (currently `SNAPSHOT`).
     * Changing it replaces the configuration.
     */
    signalType: appsignals.DynamicInstrumentationSignalType;
    /**
     * The code location to instrument (`Language`, `FilePath`, and — as the
     * language requires — `CodeUnit`, `ClassName`, `MethodName`,
     * `LineNumber`). Changing the location replaces the configuration.
     */
    location: appsignals.CodeLocation;
    /**
     * What the instrumentation captures at the location: arguments, return
     * value, stack trace, locals, and the mandatory `CaptureLimits`.
     * Configurations are immutable — changing this replaces it.
     */
    captureConfiguration: appsignals.CodeCaptureConfiguration;
    /**
     * A human-readable description of the configuration.
     */
    description?: string;
    /**
     * When the configuration expires and stops instrumenting. Accepts a
     * `Date` or an ISO timestamp string.
     */
    expiresAt?: Date | string;
    /**
     * Attribute filter groups — the instrumentation only fires when a
     * request matches all attributes within one of the groups.
     */
    attributeFilters?: {
        [key: string]: string | undefined;
    }[];
    /**
     * Tags to apply to the configuration. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface InstrumentationConfiguration extends Resource<"AWS.ApplicationSignals.InstrumentationConfiguration", InstrumentationConfigurationProps, {
    /**
     * ARN of the instrumentation configuration.
     */
    arn: string;
    /**
     * Server-computed hash uniquely identifying the instrumented location
     * within the service/environment/type/signal scope.
     */
    locationHash: string;
    /**
     * The instrumentation type (`PROBE` or `BREAKPOINT`).
     */
    instrumentationType: appsignals.InstrumentationType;
    /**
     * The Application Signals service the configuration belongs to.
     */
    service: string;
    /**
     * The service environment the configuration belongs to.
     */
    environment: string;
    /**
     * The signal type produced by the instrumentation.
     */
    signalType: appsignals.DynamicInstrumentationSignalType;
    /**
     * When the configuration was created (ISO timestamp).
     */
    createdAt: string;
}, never, Providers> {
}
/**
 * A CloudWatch Application Signals dynamic instrumentation configuration —
 * instructs instrumented SDK agents to capture a snapshot (arguments,
 * locals, return value, stack trace) at a specific code location of a
 * discovered service, without redeploying the application.
 *
 * Configurations are immutable after creation: every change except tags
 * replaces the configuration. Tags remain mutable through the standard
 * tagging APIs.
 *
 * ### Creating an Instrumentation Configuration
 * **Example:** Snapshot Probe on a Python Method
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const probe = yield* AWS.ApplicationSignals.InstrumentationConfiguration(
 *   "CheckoutProbe",
 *   {
 *     instrumentationType: "PROBE",
 *     service: "checkout-service",
 *     environment: "eks:prod",
 *     signalType: "SNAPSHOT",
 *     location: {
 *       Language: "Python",
 *       CodeUnit: "app.checkout",
 *       MethodName: "process_order",
 *       FilePath: "app/checkout.py",
 *       LineNumber: 42,
 *     },
 *     captureConfiguration: {
 *       CaptureLocals: ["order_id", "total"],
 *       CaptureLimits: { MaxHits: 100 },
 *     },
 *   },
 * );
 * ```
 *
 * **Example:** Expiring Probe with Attribute Filters
 * ```typescript
 * const probe = yield* AWS.ApplicationSignals.InstrumentationConfiguration(
 *   "DebugProbe",
 *   {
 *     instrumentationType: "PROBE",
 *     service: "checkout-service",
 *     environment: "eks:prod",
 *     signalType: "SNAPSHOT",
 *     location: {
 *       Language: "Java",
 *       ClassName: "com.example.Checkout",
 *       MethodName: "processOrder",
 *       FilePath: "src/main/java/com/example/Checkout.java",
 *     },
 *     captureConfiguration: {
 *       CaptureArguments: ["order"],
 *       CaptureLimits: { MaxHits: 10 },
 *     },
 *     expiresAt: new Date(Date.now() + 24 * 3600 * 1000),
 *     attributeFilters: [{ "aws.local.operation": "POST /checkout" }],
 *   },
 * );
 * ```
 *
 * @resource
 */
export declare const InstrumentationConfiguration: import("../../Resource.ts").ResourceClass<InstrumentationConfiguration>;
export declare const InstrumentationConfigurationProvider: () => import("effect/Layer").Layer<Provider.Provider<InstrumentationConfiguration>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=InstrumentationConfiguration.d.ts.map