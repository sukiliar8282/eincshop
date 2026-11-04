import * as Output from "../../Output.ts";
/**
 * CPU architecture of the AMI to look up.
 */
export type ImageArchitecture = "x86_64" | "arm64";
/**
 * Filters for looking up the latest matching public AMI via
 * `ec2:DescribeImages`.
 */
export interface FindImageOptions {
    /**
     * AMI owners to search, e.g. `["amazon"]` or a vendor account ID like
     * Canonical's `"099720109477"`.
     */
    owners: string[];
    /**
     * One or more AMI name patterns (glob-style). The newest available image
     * matching any pattern wins.
     */
    name: [string, ...string[]];
    /**
     * CPU architecture to filter on.
     * @default "x86_64"
     */
    architecture?: ImageArchitecture;
    /**
     * Human-readable label for the lookup (informational only).
     */
    description?: string;
    /**
     * Root device type to filter on.
     * @default "ebs"
     */
    rootDeviceType?: "ebs" | "instance-store";
    /**
     * Virtualization type to filter on.
     * @default "hvm"
     */
    virtualizationType?: "hvm" | "paravirtual";
}
/**
 * Look up the latest available AMI ID matching the given filters.
 *
 * Returns an `Output<string>` resolved at plan/deploy time via the
 * {@link getAmi} data source (and dies with a descriptive error when
 * nothing matches), so it is safe to use both in resource props and in
 * composition code that is re-executed inside a deployed runtime — the
 * lookup never runs on the deployed machine. Use the preset helpers
 * ({@link amazonLinux2023}, {@link ubuntu2404}, ...) for common distros.
 *
 * @example Find a custom AMI
 * ```typescript
 * const instance = yield* AWS.EC2.Instance("web", {
 *   imageId: AWS.EC2.image({
 *     owners: ["amazon"],
 *     name: ["al2023-ami-ecs-hvm-*"],
 *     architecture: "arm64",
 *   }),
 *   instanceType: "t4g.micro",
 *   subnetId: subnet.subnetId,
 * });
 * ```
 */
export declare const image: (options: FindImageOptions) => Output.Output<string, import("./GetAmi.ts").GetAmi>;
/**
 * Resolve the latest Amazon Linux 2023 AMI ID for the current region as an
 * `Output<string>`.
 *
 * @example Launch an Instance on Amazon Linux 2023
 * ```typescript
 * const instance = yield* AWS.EC2.Instance("web", {
 *   imageId: AWS.EC2.amazonLinux2023(),
 *   instanceType: "t3.micro",
 *   subnetId: subnet.subnetId,
 * });
 * ```
 */
export declare const amazonLinux2023: (options?: {
    architecture?: ImageArchitecture;
}) => Output.Output<string, import("./GetAmi.ts").GetAmi>;
/**
 * Resolve the latest Amazon Linux 2 AMI ID for the current region as an
 * `Output<string>`.
 */
export declare const amazonLinux2: (options?: {
    architecture?: ImageArchitecture;
}) => Output.Output<string, import("./GetAmi.ts").GetAmi>;
/**
 * Resolve the newest public Amazon Linux AMI as an `Output<string>`,
 * preferring Amazon Linux 2023 and falling back to Amazon Linux 2. Dies if
 * neither is available.
 */
export declare const amazonLinux: (options?: {
    architecture?: ImageArchitecture;
}) => Output.Output<string, import("./GetAmi.ts").GetAmi>;
/**
 * Resolve the latest Canonical Ubuntu 24.04 LTS AMI ID for the current
 * region as an `Output<string>`.
 *
 * @example Launch an Instance on Ubuntu 24.04
 * ```typescript
 * const instance = yield* AWS.EC2.Instance("web", {
 *   imageId: AWS.EC2.ubuntu2404(),
 *   instanceType: "t3.micro",
 *   subnetId: subnet.subnetId,
 * });
 * ```
 */
export declare const ubuntu2404: (options?: {
    architecture?: ImageArchitecture;
}) => Output.Output<string, import("./GetAmi.ts").GetAmi>;
/**
 * Resolve the latest Canonical Ubuntu 22.04 LTS AMI ID for the current
 * region as an `Output<string>`.
 */
export declare const ubuntu2204: (options?: {
    architecture?: ImageArchitecture;
}) => Output.Output<string, import("./GetAmi.ts").GetAmi>;
//# sourceMappingURL=Image.d.ts.map