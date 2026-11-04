import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
export interface DeploymentStrategyProps {
    /**
     * Name of the deployment strategy. Must be 1-64 characters. If omitted, a
     * deterministic physical name is generated. Changing the name replaces the
     * strategy.
     */
    deploymentStrategyName?: string;
    /**
     * Total amount of time over which the deployment rolls the configuration
     * out to targets (e.g. `"10 minutes"` or `Duration.minutes(10)`; a bare
     * number is milliseconds). Sent to AppConfig as whole minutes.
     */
    deploymentDuration: Duration.Input;
    /**
     * Percentage of targets to receive a deployed configuration during each
     * interval.
     */
    growthFactor: number;
    /**
     * How growth is applied over the deployment. `LINEAR` grows by
     * `growthFactor` each interval; `EXPONENTIAL` follows `2^(N*growthFactor)`.
     * @default "LINEAR"
     */
    growthType?: "LINEAR" | "EXPONENTIAL";
    /**
     * Amount of time AppConfig monitors for alarms before considering the
     * deployment complete (e.g. `"5 minutes"`). Sent to AppConfig as whole
     * minutes.
     * @default 0
     */
    finalBakeTime?: Duration.Input;
    /**
     * Where to save a copy of the applied configuration. Immutable — changing
     * it replaces the strategy.
     * @default "NONE"
     */
    replicateTo?: "NONE" | "SSM_DOCUMENT";
    /**
     * Description of the deployment strategy.
     */
    description?: string;
    /**
     * User-defined tags for the deployment strategy.
     */
    tags?: Record<string, string>;
}
export interface DeploymentStrategy extends Resource<"AWS.AppConfig.DeploymentStrategy", DeploymentStrategyProps, {
    deploymentStrategyId: string;
    deploymentStrategyName: string;
    deploymentStrategyArn: string;
}, never, Providers> {
}
/**
 * An AWS AppConfig deployment strategy — defines how a configuration version
 * rolls out to an environment: the total duration, the per-interval growth,
 * and the final bake time during which alarms can trigger a rollback.
 *
 * ### Creating a Deployment Strategy
 * **Example:** All-At-Once (instant, no bake)
 * ```typescript
 * const strategy = yield* AppConfig.DeploymentStrategy("Fast", {
 *   deploymentDuration: 0,
 *   growthFactor: 100,
 *   finalBakeTime: 0,
 *   replicateTo: "NONE",
 * });
 * ```
 *
 * **Example:** Linear rollout over 10 minutes
 * ```typescript
 * const strategy = yield* AppConfig.DeploymentStrategy("Linear", {
 *   deploymentDuration: "10 minutes",
 *   growthFactor: 25,
 *   growthType: "LINEAR",
 *   finalBakeTime: "5 minutes",
 * });
 * ```
 *
 * @resource
 */
export declare const DeploymentStrategy: import("../../Resource.ts").ResourceClass<DeploymentStrategy>;
export declare const DeploymentStrategyProvider: () => import("effect/Layer").Layer<Provider.Provider<DeploymentStrategy>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=DeploymentStrategy.d.ts.map