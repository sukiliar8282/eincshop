import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface StudioProps {
    /**
     * Descriptive name of the Studio. If omitted, a deterministic physical
     * name is generated. Updateable in place.
     */
    studioName?: string;
    /**
     * Authentication mode — `IAM` or `SSO` (IAM Identity Center). Changing the
     * mode replaces the Studio.
     * @default "IAM"
     */
    authMode?: "IAM" | "SSO";
    /**
     * VPC the Studio workspaces and notebooks connect to. Changing the VPC
     * replaces the Studio.
     */
    vpcId: string;
    /**
     * Subnets of the VPC the Studio can use (at most 5). Updateable in place
     * (subnets can be added, not removed).
     */
    subnetIds: string[];
    /**
     * ARN of the IAM service role the Studio assumes, trusting
     * `elasticmapreduce.amazonaws.com`. Changing the role replaces the Studio.
     */
    serviceRole: string;
    /**
     * ARN of the IAM user role Studio users assume (`SSO` auth mode only).
     * Changing the role replaces the Studio.
     */
    userRole?: string;
    /**
     * Security group for the Studio workspace (must allow outbound TCP 18888
     * to the engine security group and outbound HTTPS 443). Changing it
     * replaces the Studio.
     */
    workspaceSecurityGroupId: string;
    /**
     * Security group for the Studio engine (must allow inbound TCP 18888 from
     * the workspace security group). Changing it replaces the Studio.
     */
    engineSecurityGroupId: string;
    /**
     * S3 location that backs up Studio workspaces and notebooks, e.g.
     * `"s3://my-bucket/studio/"`. Updateable in place.
     */
    defaultS3Location: string;
    /**
     * Description of the Studio. Updateable in place.
     */
    description?: string;
    /**
     * Authentication endpoint of your identity provider (IAM federation only).
     * Changing it replaces the Studio.
     */
    idpAuthUrl?: string;
    /**
     * Name the IdP uses for its RelayState parameter (IAM federation only).
     * Changing it replaces the Studio.
     */
    idpRelayStateParameterName?: string;
    /**
     * Whether trusted identity propagation is enabled for the Studio.
     * Changing it replaces the Studio.
     */
    trustedIdentityPropagationEnabled?: boolean;
    /**
     * Whether IAM Identity Center user assignment is `REQUIRED` or `OPTIONAL`
     * (SSO auth mode only). Changing it replaces the Studio.
     */
    idcUserAssignment?: "REQUIRED" | "OPTIONAL";
    /**
     * ARN of the IAM Identity Center instance (SSO auth mode only). Changing
     * it replaces the Studio.
     */
    idcInstanceArn?: string;
    /**
     * KMS key ARN used to encrypt Studio workspace and notebook files.
     * Changing it replaces the Studio.
     */
    encryptionKeyArn?: string;
    /**
     * User-defined tags for the Studio.
     */
    tags?: Record<string, string>;
}
export interface Studio extends Resource<"AWS.EMR.Studio", StudioProps, {
    /** The ID of the Studio (e.g. `es-0123456789ABCDEFGHIJKLMNOP`). */
    studioId: string;
    /** The ARN of the Studio. */
    studioArn: string;
    /** The name of the Studio. */
    studioName: string;
    /** The unique access URL of the Studio. */
    url: string | undefined;
    /** The tags applied to the Studio. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon EMR Studio — a web-based IDE for notebooks and interactive
 * workloads that attaches to EMR clusters.
 *
 * A Studio itself is free; you pay for the clusters it attaches to. Each
 * Studio needs a VPC with subnets, a workspace and an engine security group,
 * an IAM service role, and an S3 backup location.
 * ### Creating a Studio
 * **Example:** IAM-Authenticated Studio
 * ```typescript
 * const studio = yield* Studio("Notebooks", {
 *   authMode: "IAM",
 *   vpcId: vpc.vpcId,
 *   subnetIds: [subnetA.subnetId, subnetB.subnetId],
 *   serviceRole: serviceRole.roleArn,
 *   workspaceSecurityGroupId: workspaceSg.groupId,
 *   engineSecurityGroupId: engineSg.groupId,
 *   defaultS3Location: Output.interpolate`s3://${bucket.bucketName}/studio/`,
 * });
 * ```
 *
 * **Example:** Studio with Description and Tags
 * ```typescript
 * const studio = yield* Studio("Notebooks", {
 *   authMode: "IAM",
 *   vpcId: vpc.vpcId,
 *   subnetIds: [subnetA.subnetId],
 *   serviceRole: serviceRole.roleArn,
 *   workspaceSecurityGroupId: workspaceSg.groupId,
 *   engineSecurityGroupId: engineSg.groupId,
 *   defaultS3Location: Output.interpolate`s3://${bucket.bucketName}/studio/`,
 *   description: "Data-science notebooks",
 *   tags: { team: "analytics" },
 * });
 * ```
 *
 * @resource
 */
export declare const Studio: import("../../Resource.ts").ResourceClass<Studio>;
export declare const StudioProvider: () => import("effect/Layer").Layer<Provider.Provider<Studio>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Studio.d.ts.map