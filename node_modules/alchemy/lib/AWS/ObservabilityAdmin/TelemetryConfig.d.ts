import type { Credentials } from "@distilled.cloud/aws/Credentials";
import type { Region } from "@distilled.cloud/aws/Region";
import type * as HttpClient from "effect/unstable/http/HttpClient";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface TelemetryConfigProps {
    /**
     * Whether the CloudWatch telemetry config feature (telemetry evaluation)
     * is onboarded for this account. Set `false` to keep the resource in the
     * stack while the feature is off.
     * @default true
     */
    enabled?: boolean;
}
export interface TelemetryConfig extends Resource<"AWS.ObservabilityAdmin.TelemetryConfig", TelemetryConfigProps, {
    /**
     * The onboarding status of the telemetry config feature after
     * reconciliation (`RUNNING` or `STOPPED`).
     */
    status: string;
    /**
     * The status observed before this stack first managed the feature
     * (`NOT_STARTED`, `RUNNING`, `STOPPED`, ...). Destroy restores this —
     * a feature that was already running when the stack adopted it is left
     * running.
     */
    priorStatus: string;
}, never, Providers> {
}
/**
 * Account-level CloudWatch **telemetry config** (Observability Admin
 * telemetry evaluation) — an account singleton that audits which AWS
 * resources (VPCs, Lambda functions, ...) have telemetry such as flow
 * logs enabled.
 *
 * This is an always-present account *setting*, not a discrete resource:
 * deploying it onboards the account, and destroying it restores whatever
 * onboarding state the account had before the stack first managed it.
 *
 * ### Managing telemetry config
 * **Example:** Onboard the account
 * ```typescript
 * import * as ObservabilityAdmin from "alchemy/AWS/ObservabilityAdmin";
 *
 * const telemetry = yield* ObservabilityAdmin.TelemetryConfig("Telemetry");
 * ```
 *
 * **Example:** Keep the resource but switch the feature off
 * ```typescript
 * const telemetry = yield* ObservabilityAdmin.TelemetryConfig("Telemetry", {
 *   enabled: false,
 * });
 * ```
 *
 * @resource
 */
export declare const TelemetryConfig: import("../../Resource.ts").ResourceClass<TelemetryConfig>;
declare const TelemetryConfigTransitionFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "TelemetryConfigTransitionFailed";
} & Readonly<A>;
/**
 * Raised when the telemetry config feature reports `FAILED_START` /
 * `FAILED_STOP`, or fails to converge within the bounded wait.
 */
export declare class TelemetryConfigTransitionFailed extends TelemetryConfigTransitionFailed_base<{
    message: string;
    status: string;
}> {
}
type ObsRequirements = Credentials | Region | HttpClient.HttpClient;
export declare const TelemetryConfigProvider: () => import("effect/Layer").Layer<Provider.Provider<TelemetryConfig>, never, ObsRequirements>;
export {};
//# sourceMappingURL=TelemetryConfig.d.ts.map