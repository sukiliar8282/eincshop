import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
declare const ServiceLinkedRoleDeletionFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "ServiceLinkedRoleDeletionFailed";
} & Readonly<A>;
/**
 * Deleting a service-linked role is asynchronous: `deleteServiceLinkedRole`
 * returns a deletion task that can end in `FAILED` (usually because the
 * linked service still has resources using the role). The failure reason —
 * including the offending resource ARNs, when the service reports them —
 * is surfaced on this error.
 */
export declare class ServiceLinkedRoleDeletionFailed extends ServiceLinkedRoleDeletionFailed_base<{
    readonly roleName: string;
    readonly status: string;
    readonly reason: string | undefined;
}> {
    get message(): string;
}
export interface ServiceLinkedRoleProps {
    /**
     * The service principal the role is linked to, e.g.
     * `autoscaling.amazonaws.com` or `elasticbeanstalk.amazonaws.com`.
     * The linked service owns the role's name, trust policy, and permissions.
     */
    awsServiceName: string;
    /**
     * Optional suffix appended to the AWS-generated role name
     * (`AWSServiceRoleFor<Service>_<customSuffix>`). Only some services allow
     * suffixes; services that don't reject the create with `InvalidInputException`.
     * Use a suffix to create multiple service-linked roles for the same service.
     */
    customSuffix?: string;
    /**
     * Optional description for the role. The description is the only aspect of
     * a service-linked role IAM allows editing after creation.
     */
    description?: string;
}
export interface ServiceLinkedRole extends Resource<"AWS.IAM.ServiceLinkedRole", ServiceLinkedRoleProps, {
    /** The name of the service-linked role. */
    roleName: string;
    /** The ARN of the service-linked role. */
    roleArn: string;
    /** The stable unique ID of the role. */
    roleId: string | undefined;
    /** The IAM path of the role. */
    path: string | undefined;
    /** The AWS service principal the role is linked to. */
    awsServiceName: string;
    /** The custom suffix appended to the role name, if any. */
    customSuffix: string | undefined;
    /** The description of the role. */
    description: string | undefined;
}, never, Providers> {
}
/**
 * An IAM role linked to (and managed by) a specific AWS service.
 *
 * The linked service controls the role's trust and permissions policies; the
 * only mutable aspect is the description. Deletion is asynchronous — the
 * provider submits a deletion task and waits (bounded) for it to complete,
 * failing with {@link ServiceLinkedRoleDeletionFailed} when the linked service
 * still has resources using the role.
 *
 * Some services auto-create their service-linked role on first use; deploying
 * this resource over an existing role adopts it (the create API reports the
 * collision and the provider converges on the existing role).
 * ### Creating Service-Linked Roles
 * **Example:** Auto Scaling Service-Linked Role
 * ```typescript
 * const role = yield* ServiceLinkedRole("AutoScalingRole", {
 *   awsServiceName: "autoscaling.amazonaws.com",
 * });
 * ```
 *
 * **Example:** Suffixed Role for a Dedicated Workload
 * ```typescript
 * const role = yield* ServiceLinkedRole("WorkloadRole", {
 *   awsServiceName: "autoscaling.amazonaws.com",
 *   customSuffix: "analytics",
 *   description: "Auto Scaling role scoped to the analytics workload",
 * });
 * ```
 *
 * @resource
 */
export declare const ServiceLinkedRole: import("../../Resource.ts").ResourceClass<ServiceLinkedRole>;
export declare const ServiceLinkedRoleProvider: () => import("effect/Layer").Layer<Provider.Provider<ServiceLinkedRole>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
export {};
//# sourceMappingURL=ServiceLinkedRole.d.ts.map