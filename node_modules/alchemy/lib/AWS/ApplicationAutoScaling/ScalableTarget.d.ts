import * as aas from "@distilled.cloud/aws/application-auto-scaling";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ScalableTargetProps {
    /**
     * The namespace of the AWS service that provides the resource,
     * e.g. `ecs`, `dynamodb`, `lambda`.
     *
     * Changing this triggers a replacement.
     */
    serviceNamespace: aas.ServiceNamespace;
    /**
     * The identifier of the resource to scale, in the format the service
     * expects — e.g. `service/{clusterName}/{serviceName}` for an ECS service
     * or `table/{tableName}` for a DynamoDB table.
     *
     * Changing this triggers a replacement.
     */
    resourceId: string;
    /**
     * The scalable dimension of the resource,
     * e.g. `ecs:service:DesiredCount` or `dynamodb:table:ReadCapacityUnits`.
     *
     * Changing this triggers a replacement.
     */
    scalableDimension: aas.ScalableDimension;
    /**
     * The minimum capacity that Application Auto Scaling may scale in to.
     */
    minCapacity: number;
    /**
     * The maximum capacity that Application Auto Scaling may scale out to.
     */
    maxCapacity: number;
    /**
     * IAM role that allows Application Auto Scaling to modify the scalable
     * target on your behalf. For services that support service-linked roles
     * (ECS, DynamoDB, Lambda, ...) omit this — AWS creates and uses the
     * service-linked role automatically.
     */
    roleArn?: string;
    /**
     * Suspend/resume the target's dynamic and scheduled scaling activities.
     */
    suspendedState?: aas.SuspendedState;
    /**
     * User-defined tags to apply to the scalable target.
     */
    tags?: Record<string, string>;
}
export interface ScalableTarget extends Resource<"AWS.ApplicationAutoScaling.ScalableTarget", ScalableTargetProps, {
    /**
     * Namespace of the AWS service that provides the resource.
     */
    serviceNamespace: aas.ServiceNamespace;
    /**
     * Identifier of the scaled resource.
     */
    resourceId: string;
    /**
     * Scalable dimension being managed.
     */
    scalableDimension: aas.ScalableDimension;
    /**
     * ARN of the scalable target.
     */
    scalableTargetArn: string;
    /**
     * Minimum capacity Application Auto Scaling may scale in to.
     */
    minCapacity: number;
    /**
     * Maximum capacity Application Auto Scaling may scale out to.
     */
    maxCapacity: number;
    /**
     * IAM role Application Auto Scaling uses to modify the target
     * (service-linked role when none was supplied).
     */
    roleArn: string;
    /**
     * Suspension state of dynamic and scheduled scaling activities.
     */
    suspendedState: aas.SuspendedState | undefined;
}, never, Providers> {
}
/**
 * An Application Auto Scaling scalable target — registers a resource's
 * capacity dimension (an ECS service's desired count, a DynamoDB table's
 * read capacity, Lambda provisioned concurrency, ...) so that scaling
 * policies and scheduled actions can act on it.
 *
 * A scalable target is uniquely identified by the
 * (`serviceNamespace`, `resourceId`, `scalableDimension`) triple; changing
 * any part of the triple replaces the target. Deregistering a scalable
 * target deletes the scaling policies and scheduled actions associated
 * with it.
 * ### Creating Scalable Targets
 * **Example:** Scale an ECS Service
 * ```typescript
 * const target = yield* ScalableTarget("ApiScaling", {
 *   serviceNamespace: "ecs",
 *   resourceId: Output.interpolate`service/${cluster.clusterName}/${service.serviceName}`,
 *   scalableDimension: "ecs:service:DesiredCount",
 *   minCapacity: 1,
 *   maxCapacity: 3,
 * });
 * ```
 *
 * **Example:** Scale DynamoDB Read Capacity
 * ```typescript
 * const target = yield* ScalableTarget("TableReadScaling", {
 *   serviceNamespace: "dynamodb",
 *   resourceId: Output.interpolate`table/${table.tableName}`,
 *   scalableDimension: "dynamodb:table:ReadCapacityUnits",
 *   minCapacity: 1,
 *   maxCapacity: 10,
 * });
 * ```
 *
 * ### Suspending Scaling
 * **Example:** Suspend Dynamic Scale-In
 * ```typescript
 * yield* ScalableTarget("ApiScaling", {
 *   serviceNamespace: "ecs",
 *   resourceId: Output.interpolate`service/${cluster.clusterName}/${service.serviceName}`,
 *   scalableDimension: "ecs:service:DesiredCount",
 *   minCapacity: 1,
 *   maxCapacity: 3,
 *   suspendedState: { DynamicScalingInSuspended: true },
 * });
 * ```
 *
 * @resource
 */
export declare const ScalableTarget: import("../../Resource.ts").ResourceClass<ScalableTarget>;
export declare const ScalableTargetProvider: () => import("effect/Layer").Layer<Provider.Provider<ScalableTarget>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ScalableTarget.d.ts.map