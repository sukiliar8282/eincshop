import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface WorkgroupProps {
    /**
     * Name of the workgroup. Must be 3-64 characters, lowercase letters,
     * numbers, and hyphens. If omitted, a deterministic physical name is
     * generated. Changing the name replaces the workgroup.
     */
    workgroupName?: string;
    /**
     * Name of the namespace this workgroup provides compute for. Changing the
     * namespace replaces the workgroup.
     */
    namespaceName: string;
    /**
     * Base compute capacity in Redshift Processing Units (RPUs), 8-1024 in
     * multiples of 8. 8 RPU is the cheapest configuration.
     * @default 8
     */
    baseCapacity?: number;
    /**
     * Maximum RPUs the workgroup can burst to. Omit to disable the ceiling.
     */
    maxCapacity?: number;
    /**
     * Route all traffic through the VPC (enhanced VPC routing) instead of the
     * internet.
     * @default false
     */
    enhancedVpcRouting?: boolean;
    /**
     * Whether the workgroup is reachable from the public internet.
     * @default false
     */
    publiclyAccessible?: boolean;
    /**
     * VPC subnet IDs the workgroup runs in. Must span at least three
     * Availability Zones. Defaults to the account's default-VPC subnets.
     */
    subnetIds?: string[];
    /**
     * VPC security group IDs attached to the workgroup.
     */
    securityGroupIds?: string[];
    /**
     * Port the workgroup listens on.
     * @default 5439
     */
    port?: number;
    /**
     * Redshift configuration parameters (e.g. `max_query_execution_time`,
     * `enable_user_activity_logging`) as key/value pairs.
     */
    configParameters?: Record<string, string>;
    /**
     * User-defined tags for the workgroup.
     */
    tags?: Record<string, string>;
}
export interface Workgroup extends Resource<"AWS.RedshiftServerless.Workgroup", WorkgroupProps, {
    /**
     * Name of the workgroup.
     */
    workgroupName: string;
    /**
     * ARN of the workgroup.
     */
    workgroupArn: string;
    /**
     * Unique ID of the workgroup.
     */
    workgroupId: string;
    /**
     * Name of the namespace the workgroup computes against.
     */
    namespaceName: string;
    /**
     * Current workgroup status (e.g. `"AVAILABLE"`).
     */
    status: string;
    /**
     * DNS address of the workgroup endpoint (pgwire host).
     */
    endpointAddress: string | undefined;
    /**
     * Port of the workgroup endpoint (5439 by default).
     */
    endpointPort: number | undefined;
    /**
     * Whether the endpoint is reachable from the public internet.
     */
    publiclyAccessible: boolean | undefined;
}, never, Providers> {
}
/**
 * An Amazon Redshift Serverless workgroup — the compute half of a serverless
 * data warehouse.
 *
 * A workgroup provides on-demand compute (measured in RPUs) against a
 * {@link Namespace}'s data. Creating a workgroup is asynchronous and takes
 * roughly 2-5 minutes; the provider waits (bounded) for it to become
 * `AVAILABLE`. Because a running workgroup bills against its RPU floor, tear
 * it down promptly when you are done.
 *
 * ### Creating a Workgroup
 * **Example:** Minimal (Cheapest) Workgroup
 * ```typescript
 * const namespace = yield* RedshiftServerless.Namespace("Analytics", {
 *   adminUsername: "admin",
 *   manageAdminPassword: true,
 * });
 * const workgroup = yield* RedshiftServerless.Workgroup("AnalyticsWg", {
 *   namespaceName: namespace.namespaceName,
 *   baseCapacity: 8,
 * });
 * // workgroup.endpointAddress -> "<wg>.<account>.<region>.redshift-serverless.amazonaws.com"
 * ```
 *
 * ### Networking
 * **Example:** Publicly Accessible with Explicit Subnets
 * ```typescript
 * const workgroup = yield* RedshiftServerless.Workgroup("AnalyticsWg", {
 *   namespaceName: namespace.namespaceName,
 *   baseCapacity: 8,
 *   publiclyAccessible: true,
 *   subnetIds: [subnetA.subnetId, subnetB.subnetId, subnetC.subnetId],
 *   securityGroupIds: [securityGroup.groupId],
 *   enhancedVpcRouting: false,
 * });
 * ```
 *
 * @resource
 */
export declare const Workgroup: import("../../Resource.ts").ResourceClass<Workgroup>;
export declare const WorkgroupProvider: () => import("effect/Layer").Layer<Provider.Provider<Workgroup>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Workgroup.d.ts.map