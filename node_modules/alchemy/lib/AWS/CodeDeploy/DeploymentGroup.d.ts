import * as codedeploy from "@distilled.cloud/aws/codedeploy";
import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
/**
 * Blue/green deployment behaviour for a deployment group. Mirrors the wire
 * `BlueGreenDeploymentConfiguration` with `Duration.Input` wait times
 * (CodeDeploy's wire unit for both is whole minutes).
 */
export interface BlueGreenDeploymentConfigurationProps {
    /**
     * What happens to the original (blue) instances after a successful
     * blue/green deployment.
     */
    terminateBlueInstancesOnDeploymentSuccess?: {
        /**
         * `TERMINATE` the blue instances (after `terminationWaitTime`) or
         * `KEEP_ALIVE` them deregistered from the load balancer.
         */
        action?: codedeploy.InstanceAction;
        /**
         * How long to wait after a successful deployment before terminating
         * the blue instances. Wire unit: whole minutes.
         */
        terminationWaitTime?: Duration.Input;
    };
    /**
     * How traffic is rerouted to the green fleet once it is provisioned.
     */
    deploymentReadyOption?: {
        /**
         * `CONTINUE_DEPLOYMENT` reroutes automatically; `STOP_DEPLOYMENT`
         * waits for {@link ContinueDeployment} (up to `waitTime`).
         */
        actionOnTimeout?: codedeploy.DeploymentReadyAction;
        /**
         * How long to wait for a manual continue before the deployment stops
         * (only with `actionOnTimeout: "STOP_DEPLOYMENT"`). Wire unit: whole
         * minutes.
         */
        waitTime?: Duration.Input;
    };
    /**
     * How the green fleet's instances are provisioned (discover existing or
     * copy the Auto Scaling group).
     */
    greenFleetProvisioningOption?: codedeploy.GreenFleetProvisioningOption;
}
export interface DeploymentGroupProps {
    /**
     * Name of the CodeDeploy application that owns the group. Pass an
     * `Application`'s `applicationName` attribute. Immutable — changing it
     * replaces the deployment group.
     */
    applicationName: string;
    /**
     * Name of the deployment group (1-100 chars). If omitted a deterministic
     * physical name is generated. Changing the name replaces the group.
     */
    deploymentGroupName?: string;
    /**
     * ARN of the IAM service role that grants CodeDeploy access to the target
     * compute resources. Required.
     */
    serviceRoleArn: string;
    /**
     * Name of the deployment configuration (predefined like
     * `CodeDeployDefault.LambdaAllAtOnce`, or a custom `DeploymentConfig`).
     */
    deploymentConfigName?: string;
    /**
     * How the deployment routes traffic (in-place vs. blue/green).
     */
    deploymentStyle?: codedeploy.DeploymentStyle;
    /**
     * Automatic rollback behaviour on deployment failure or alarm.
     */
    autoRollbackConfiguration?: codedeploy.AutoRollbackConfiguration;
    /**
     * CloudWatch alarms that can stop a deployment.
     */
    alarmConfiguration?: codedeploy.AlarmConfiguration;
    /**
     * Load-balancer configuration used for traffic shifting.
     */
    loadBalancerInfo?: codedeploy.LoadBalancerInfo;
    /**
     * Blue/green deployment configuration (green-fleet provisioning, traffic
     * ready-options, blue-instance termination). Wait times accept
     * `Duration.Input` (e.g. `"5 minutes"`).
     */
    blueGreenDeploymentConfiguration?: BlueGreenDeploymentConfigurationProps;
    /**
     * EC2 tag filters selecting the instances to deploy to (EC2/on-prem
     * `Server` platform).
     */
    ec2TagFilters?: codedeploy.EC2TagFilter[];
    /**
     * Auto Scaling group names to deploy to (EC2/on-prem `Server` platform).
     */
    autoScalingGroups?: string[];
    /**
     * ECS services (cluster + service) targeted by blue/green ECS deployments.
     */
    ecsServices?: codedeploy.ECSService[];
    /**
     * SNS/notification triggers fired on deployment lifecycle events.
     */
    triggerConfigurations?: codedeploy.TriggerConfig[];
    /**
     * User-defined tags.
     */
    tags?: Record<string, string>;
}
export interface DeploymentGroup extends Resource<"AWS.CodeDeploy.DeploymentGroup", DeploymentGroupProps, {
    /** Physical name of the deployment group. */
    deploymentGroupName: string;
    /** Unique CodeDeploy-assigned deployment-group ID. */
    deploymentGroupId: string;
    /** ARN of the deployment group. */
    deploymentGroupArn: string;
    /** Name of the application this group belongs to. */
    applicationName: string;
    /** ARN of the service role CodeDeploy assumes for deployments. */
    serviceRoleArn: string;
}, never, Providers> {
}
/**
 * An AWS CodeDeploy deployment group — the set of target instances/functions
 * plus the deployment configuration for one {@link Application}. For the
 * `Lambda` compute platform a group ties a service role and a deployment
 * config (e.g. `CodeDeployDefault.LambdaAllAtOnce`) to an application.
 *
 * ### Creating a Deployment Group
 * **Example:** Lambda Deployment Group
 * ```typescript
 * const app = yield* CodeDeploy.Application("api", { computePlatform: "Lambda" });
 * const group = yield* CodeDeploy.DeploymentGroup("prod", {
 *   applicationName: app.applicationName,
 *   serviceRoleArn: role.roleArn,
 *   deploymentConfigName: "CodeDeployDefault.LambdaAllAtOnce",
 *   deploymentStyle: {
 *     deploymentType: "BLUE_GREEN",
 *     deploymentOption: "WITH_TRAFFIC_CONTROL",
 *   },
 *   autoRollbackConfiguration: {
 *     enabled: true,
 *     events: ["DEPLOYMENT_FAILURE"],
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const DeploymentGroup: import("../../Resource.ts").ResourceClass<DeploymentGroup>;
export declare const DeploymentGroupProvider: () => import("effect/Layer").Layer<Provider.Provider<DeploymentGroup>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=DeploymentGroup.d.ts.map