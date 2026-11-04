import type { Credentials } from "@distilled.cloud/aws/Credentials";
import { Region } from "@distilled.cloud/aws/Region";
import * as FileSystem from "effect/FileSystem";
import type * as rolldown from "rolldown";
import type { Input } from "../../Input.ts";
import { Platform, type Main, type PlatformProps } from "../../Platform.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { Stack } from "../../Stack.ts";
import { Stage } from "../../Stage.ts";
import type { SecurityGroupId } from "../EC2/SecurityGroup.ts";
import { type Ec2HostRuntimeContext } from "../EC2/hosted.ts";
import type { AccountID } from "../Environment.ts";
import type { PolicyStatement } from "../IAM/Policy.ts";
import type { Providers } from "../Providers.ts";
import type { RegionID } from "../Region.ts";
export type LaunchTemplateId = `lt-${string}`;
export type LaunchTemplateName = string;
export type LaunchTemplateArn = `arn:aws:ec2:${RegionID}:${AccountID}:launch-template/${LaunchTemplateId}`;
export interface LaunchTemplateProps extends PlatformProps {
    /**
     * Launch template name. If omitted, a deterministic name is generated.
     */
    launchTemplateName?: string;
    /**
     * AMI ID to launch.
     */
    imageId: string;
    /**
     * EC2 instance type, such as `t3.micro`.
     */
    instanceType: string;
    /**
     * Security groups to attach to the primary network interface.
     */
    securityGroupIds?: Input<SecurityGroupId>[];
    /**
     * Optional EC2 key pair name for SSH access.
     */
    keyName?: string;
    /**
     * Optional IAM instance profile name to attach at launch.
     */
    instanceProfileName?: string;
    /**
     * User data script to provide at launch time.
     */
    userData?: string;
    /**
     * Whether to associate a public IPv4 address on launch.
     */
    associatePublicIpAddress?: boolean;
    /**
     * User-defined tags to apply to the launch template and launched instances.
     */
    tags?: Record<string, string>;
    /**
     * Module entrypoint for the bundled instance program.
     * When omitted, the launch template behaves as a low-level EC2 primitive.
     */
    main?: string;
    /**
     * Named export to load from `main`.
     * @default "default"
     */
    handler?: string;
    /**
     * Port exposed by the process, if any.
     * @default 3000
     */
    port?: number;
    /**
     * Additional environment variables for the hosted process.
     */
    env?: Record<string, any>;
    /**
     * Bundler configuration for the hosted process entrypoint.
     */
    build?: {
        input?: Partial<rolldown.InputOptions>;
        output?: Partial<rolldown.OutputOptions>;
    };
    /**
     * Additional managed policy ARNs for the managed instance role.
     * This can only be used when Alchemy manages the instance profile.
     */
    roleManagedPolicyArns?: string[];
}
export interface LaunchTemplate extends Resource<"AWS.AutoScaling.LaunchTemplate", LaunchTemplateProps, {
    /**
     * ID of the launch template (`lt-...`).
     */
    launchTemplateId: LaunchTemplateId;
    /**
     * ARN of the launch template.
     */
    launchTemplateArn: LaunchTemplateArn;
    /**
     * Name of the launch template.
     */
    launchTemplateName: LaunchTemplateName;
    /**
     * Version number launched by default.
     */
    defaultVersionNumber: number;
    /**
     * Most recently created version number.
     */
    latestVersionNumber: number;
    /**
     * Tags on the launch template.
     */
    tags: Record<string, string>;
    /**
     * ARN of the managed instance role, when Alchemy manages IAM.
     */
    roleArn?: string;
    /**
     * Name of the managed instance role, when Alchemy manages IAM.
     */
    roleName?: string;
    /**
     * Name of the inline policy on the managed instance role.
     */
    policyName?: string;
    /**
     * Whether Alchemy manages the instance profile/role for the hosted
     * program.
     */
    managedIam?: boolean;
    /**
     * systemd unit name running the hosted program on instances.
     */
    runtimeUnitName?: string;
    /**
     * S3 key prefix where the bundled program assets are staged.
     */
    assetPrefix?: string;
    /**
     * Bundled program code metadata.
     */
    code?: {
        /**
         * Content hash of the bundled entrypoint.
         */
        hash: string;
    };
}, {
    /**
     * Environment variables contributed by bindings to the hosted process.
     */
    env?: Record<string, any>;
    /**
     * IAM policy statements contributed by bindings to the instance role.
     */
    policyStatements?: PolicyStatement[];
}, Providers> {
}
export type LaunchTemplateServices = Credentials | Region;
export type LaunchTemplateShape = Main<LaunchTemplateServices>;
export type LaunchTemplateRuntimeContext = Ec2HostRuntimeContext;
/**
 * A launch template that preserves the `Host` authoring model used by
 * `AWS.EC2.Instance`, but packages that host configuration for use with an
 * Auto Scaling Group.
 * ### Creating a Launch Template
 * **Example:** Basic Launch Template
 * ```typescript
 * import { LaunchTemplate } from "alchemy/AWS/AutoScaling";
 *
 * const template = yield* LaunchTemplate("Template", {
 *   imageId: "ami-0abcdef1234567890",
 *   instanceType: "t3.micro",
 * });
 * ```
 *
 * **Example:** Launch a fleet from the template
 * ```typescript
 * import { AutoScalingGroup } from "alchemy/AWS/AutoScaling";
 *
 * const group = yield* AutoScalingGroup("Fleet", {
 *   launchTemplate: template,
 *   subnetIds: [subnet.subnetId],
 *   minSize: 1,
 *   maxSize: 3,
 * });
 * ```
 *
 * ### Hosting Processes
 * **Example:** Hosted HTTP Launch Template
 * ```typescript
 * const template = yield* Effect.gen(function* () {
 *   yield* Http.serve(HttpServerResponse.json({ ok: true }));
 *
 *   return {
 *     main: import.meta.url,
 *     imageId,
 *     instanceType: "t3.small",
 *     securityGroupIds: [securityGroup.groupId],
 *     port: 3000,
 *   };
 * }).pipe(
 *   Effect.provide(AWS.EC2.HttpServer),
 *   AWS.AutoScaling.LaunchTemplate("ApiTemplate"),
 * );
 * ```
 *
 * @resource
 */
export declare const LaunchTemplate: Platform<LaunchTemplate, LaunchTemplateServices, LaunchTemplateShape, LaunchTemplateRuntimeContext>;
export declare const LaunchTemplateProvider: () => import("effect/Layer").Layer<Provider.Provider<LaunchTemplate>, never, import("../Assets.ts").Assets | FileSystem.FileSystem | import("effect/Path").Path | Stack | Stage | import("../Assets.ts").AssetsRequirements>;
//# sourceMappingURL=LaunchTemplate.d.ts.map