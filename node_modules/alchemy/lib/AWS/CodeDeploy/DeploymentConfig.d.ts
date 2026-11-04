import * as codedeploy from "@distilled.cloud/aws/codedeploy";
import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
/**
 * Zonal deployment behaviour (EC2/on-prem `Server` platform): deploy one
 * Availability Zone at a time, monitoring each zone before moving on.
 * Mirrors the wire `ZonalConfig` with `Duration.Input` monitor durations
 * (CodeDeploy's wire unit for both is whole seconds).
 */
export interface ZonalConfigProps {
    /**
     * How long to monitor the FIRST zone after it finishes before starting
     * the next zone. Wire unit: whole seconds.
     * @default monitorDuration
     */
    firstZoneMonitorDuration?: Duration.Input;
    /**
     * How long to monitor each subsequent zone after it finishes before
     * starting the next one. Wire unit: whole seconds.
     * @default 0
     */
    monitorDuration?: Duration.Input;
    /**
     * Minimum healthy hosts required per Availability Zone while deploying.
     */
    minimumHealthyHostsPerZone?: codedeploy.MinimumHealthyHostsPerZone;
}
export interface DeploymentConfigProps {
    /**
     * Name of the deployment configuration (1-100 chars). If omitted a
     * deterministic physical name is generated. Changing the name replaces
     * the configuration.
     */
    deploymentConfigName?: string;
    /**
     * The compute platform the configuration applies to. Immutable — changing
     * it replaces the configuration.
     * @default "Server"
     */
    computePlatform?: "Server" | "Lambda" | "ECS";
    /**
     * Minimum healthy hosts during the deployment (`HOST_COUNT` or
     * `FLEET_PERCENT`). `Server` platform only.
     */
    minimumHealthyHosts?: codedeploy.MinimumHealthyHosts;
    /**
     * How traffic shifts to the new version (`TimeBasedCanary`,
     * `TimeBasedLinear`, or `AllAtOnce`). `Lambda`/`ECS` platforms. The
     * `canaryInterval`/`linearInterval` fields are whole minutes (the wire
     * unit is semantically part of the AWS field).
     */
    trafficRoutingConfig?: codedeploy.TrafficRoutingConfig;
    /**
     * Deploy one Availability Zone at a time with per-zone monitor
     * durations. `Server` platform only.
     */
    zonalConfig?: ZonalConfigProps;
}
export interface DeploymentConfig extends Resource<"AWS.CodeDeploy.DeploymentConfig", DeploymentConfigProps, {
    /** Physical name of the deployment configuration. */
    deploymentConfigName: string;
    /** Unique CodeDeploy-assigned deployment-config ID. */
    deploymentConfigId: string;
    /** ARN of the deployment configuration. */
    deploymentConfigArn: string;
    /** The compute platform (`Lambda`, `Server`, or `ECS`). */
    computePlatform: string;
}, never, Providers> {
}
/**
 * A custom AWS CodeDeploy deployment configuration — the rules for how
 * traffic shifts during a deployment (canary/linear traffic routing for
 * `Lambda`/`ECS`, minimum-healthy-hosts and zonal rollout for `Server`).
 * Deployment configurations are immutable: any change replaces the
 * configuration.
 *
 * ### Creating a Deployment Config
 * **Example:** Lambda Canary Config
 * ```typescript
 * const config = yield* CodeDeploy.DeploymentConfig("canary", {
 *   computePlatform: "Lambda",
 *   trafficRoutingConfig: {
 *     type: "TimeBasedCanary",
 *     timeBasedCanary: { canaryPercentage: 10, canaryInterval: 5 },
 *   },
 * });
 * ```
 *
 * **Example:** Server Config with Minimum Healthy Hosts
 * ```typescript
 * const config = yield* CodeDeploy.DeploymentConfig("half-fleet", {
 *   computePlatform: "Server",
 *   minimumHealthyHosts: { type: "FLEET_PERCENT", value: 50 },
 * });
 * ```
 *
 * @resource
 */
export declare const DeploymentConfig: import("../../Resource.ts").ResourceClass<DeploymentConfig>;
export declare const DeploymentConfigProvider: () => import("effect/Layer").Layer<Provider.Provider<DeploymentConfig>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=DeploymentConfig.d.ts.map