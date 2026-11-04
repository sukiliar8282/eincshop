import type { Credentials } from "@distilled.cloud/aws/Credentials";
import { Region } from "@distilled.cloud/aws/Region";
import * as FileSystem from "effect/FileSystem";
import * as Bundle from "../../Bundle/Bundle.ts";
import type { Input } from "../../Input.ts";
import { Platform, type Main, type PlatformProps } from "../../Platform.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { ServerHost } from "../../Server/Process.ts";
import { Stack } from "../../Stack.ts";
import { Stage } from "../../Stage.ts";
import type { AccountID } from "../Environment.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { PolicyStatement } from "../IAM/Policy.ts";
import type { Providers } from "../Providers.ts";
import type { RegionID } from "../Region.ts";
import { type Ec2HostRuntimeContext } from "./hosted.ts";
import type { SecurityGroupId } from "./SecurityGroup.ts";
import type { SubnetId } from "./Subnet.ts";
import type { VpcId } from "./Vpc.ts";
export type InstanceId<ID extends string = string> = `i-${ID}`;
export declare const InstanceId: <ID extends string>(id: ID) => ID & InstanceId<ID>;
export type InstanceArn<ID extends InstanceId = InstanceId> = `arn:aws:ec2:${RegionID}:${AccountID}:instance/${ID}`;
export declare const isInstance: (value: any) => value is Instance;
export interface InstanceProps extends PlatformProps {
    /**
     * AMI ID to launch.
     */
    imageId: string;
    /**
     * EC2 instance type, such as `t3.micro`.
     */
    instanceType: string;
    /**
     * Optional subnet to launch into.
     */
    subnetId?: Input<SubnetId>;
    /**
     * Security groups to attach to the primary network interface.
     */
    securityGroupIds?: Input<SecurityGroupId>[];
    /**
     * Optional EC2 key pair name for SSH access. Accepts a reference such as
     * `AWS.EC2.KeyPair(...).keyName`.
     */
    keyName?: Input<string>;
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
     * Optional private IPv4 address for the primary interface.
     */
    privateIpAddress?: string;
    /**
     * Optional availability zone override.
     */
    availabilityZone?: string;
    /**
     * Whether source/destination checking is enabled.
     * @default true
     */
    sourceDestCheck?: boolean;
    /**
     * User-defined tags to apply to the instance.
     */
    tags?: Record<string, string>;
    /**
     * Module entrypoint for the bundled instance program.
     * When omitted, the instance behaves as a low-level EC2 resource.
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
     * Bundler configuration for the hosted process entrypoint. Unused
     * code is tree-shaken. `effect`, alchemy, and `@distilled.cloud` are
     * marked pure so unused parts prune more aggressively. List extra
     * packages with `pure.packages`, or disable with `pure: false`.
     */
    build?: Bundle.BundleConfig;
    /**
     * Additional managed policy ARNs for the managed instance role.
     * This can only be used when Alchemy manages the instance profile.
     */
    roleManagedPolicyArns?: string[];
}
export interface Instance extends Resource<"AWS.EC2.Instance", InstanceProps, {
    /**
     * The ID of the instance.
     */
    instanceId: InstanceId;
    /**
     * The Amazon Resource Name (ARN) of the instance.
     */
    instanceArn: InstanceArn;
    /**
     * The AMI ID the instance launched from.
     */
    imageId: string;
    /**
     * The instance type.
     */
    instanceType: string;
    /**
     * The current instance state.
     */
    state: string;
    /**
     * The VPC the instance belongs to, if any.
     */
    vpcId?: VpcId;
    /**
     * The subnet the instance belongs to, if any.
     */
    subnetId?: SubnetId;
    /**
     * The availability zone of the instance.
     */
    availabilityZone?: string;
    /**
     * The attached security group IDs.
     */
    securityGroupIds: string[];
    /**
     * The primary private IPv4 address.
     */
    privateIpAddress?: string;
    /**
     * The public IPv4 address, if assigned.
     */
    publicIpAddress?: string;
    /**
     * The private DNS name.
     */
    privateDnsName?: string;
    /**
     * The public DNS name, if assigned.
     */
    publicDnsName?: string;
    /**
     * The key pair name used for SSH access.
     */
    keyName?: string;
    /**
     * The IAM instance profile ARN attached to the instance, if any.
     */
    instanceProfileArn?: string;
    /**
     * The IAM instance profile ID attached to the instance, if any.
     */
    instanceProfileId?: string;
    /**
     * The IAM instance profile name attached to the instance, if known.
     */
    instanceProfileName?: string;
    /**
     * Whether source/destination checking is enabled.
     */
    sourceDestCheck?: boolean;
    /**
     * When the instance was launched.
     */
    launchTime?: string;
    /**
     * Current tags on the instance.
     */
    tags: Record<string, string>;
    /**
     * Role attached by the hosted runtime, if any.
     */
    roleArn?: string;
    /**
     * Role name attached by the hosted runtime, if any.
     */
    roleName?: string;
    /**
     * Inline policy name used for bindings/runtime sync, if any.
     */
    policyName?: string;
    /**
     * Whether the role/profile were created and owned by Alchemy.
     */
    managedIam?: boolean;
    /**
     * Deterministic runtime unit name for hosted instances.
     */
    runtimeUnitName?: string;
    /**
     * Asset prefix for hosted bundles and env files.
     */
    assetPrefix?: string;
    /**
     * Bundle hash for hosted instances.
     */
    code?: {
        hash: string;
    };
}, {
    /** Environment variables injected into the hosted instance runtime. */
    env?: Record<string, any>;
    /** IAM policy statements attached to the instance profile role. */
    policyStatements?: PolicyStatement[];
}, Providers> {
}
export type InstanceServices = ServerHost | Credentials | Region | AWSEnvironment;
export type InstanceShape = Main<InstanceServices>;
export type InstanceRuntimeContext = Ec2HostRuntimeContext;
/**
 * An EC2 instance that can either act as a low-level compute primitive or run
 * a bundled long-lived Effect program directly on the machine.
 * ### Launching Instances
 * **Example:** Basic Instance
 * ```typescript
 * const instance = yield* AWS.EC2.Instance("AppInstance", {
 *   imageId: AWS.EC2.amazonLinux2023(),
 *   instanceType: "t3.micro",
 *   subnetId: subnet.subnetId,
 * });
 * ```
 *
 * ### Hosting Processes
 * **Example:** HTTP Server on an Instance
 * ```typescript
 * const api = yield* Effect.gen(function* () {
 *   yield* Http.serve(
 *     HttpServerResponse.json({ ok: true }),
 *   );
 *
 *   return {
 *     main: import.meta.url,
 *     imageId: AWS.EC2.amazonLinux2023(),
 *     instanceType: "t3.small",
 *     subnetId: subnet.subnetId,
 *     securityGroupIds: [securityGroup.groupId],
 *     associatePublicIpAddress: true,
 *     port: 3000,
 *   };
 * }).pipe(
 *   Effect.provide(AWS.EC2.HttpServer),
 *   AWS.EC2.Instance("ApiInstance"),
 * );
 * ```
 *
 * ### Bundling & Tree-shaking
 * `main` is bundled with rolldown at deploy time. Unused code is
 * tree-shaken. `effect`, alchemy, and `@distilled.cloud` are marked
 * pure so unused parts prune more aggressively. Your app is not
 * marked pure.
 *
 * **Example:** Mark additional packages as pure
 * Only list packages with no top-level side effects.
 * ```typescript
 * {
 *   main: import.meta.url,
 *   build: {
 *     pure: { packages: ["my-lib", "@my-scope/*"] },
 *   },
 * }
 * ```
 *
 * **Example:** Turn it off
 * ```typescript
 * {
 *   main: import.meta.url,
 *   build: { pure: false },
 * }
 * ```
 *
 * @resource
 */
export declare const Instance: Platform<Instance, InstanceServices, InstanceShape, InstanceRuntimeContext>;
export declare const InstanceProvider: () => import("effect/Layer").Layer<Provider.Provider<Instance>, never, import("../Assets.ts").Assets | FileSystem.FileSystem | import("effect/Path").Path | Stack | Stage | import("../Assets.ts").AssetsRequirements>;
//# sourceMappingURL=Instance.d.ts.map