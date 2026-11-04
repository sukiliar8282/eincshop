import * as Effect from "effect/Effect";
import * as Output from "../../Output.js";
import { getAmi } from "./GetAmi.js";
const requireImageId = (options) => getAmi(options).pipe(Output.mapEffect((image) => image?.ImageId
    ? Effect.succeed(image.ImageId)
    : Effect.die(new Error(`Could not resolve ${options.description ?? "an AMI"} matching ${options.name.join(", ")}`))));
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
export const image = (options) => requireImageId(options);
const amazonLinux2023Options = (options) => ({
    owners: ["amazon"],
    // `al2023-ami-2023.*` selects the standard image. The broader
    // `al2023-ami-*` also matches `al2023-ami-minimal-*`, which ships without
    // the SSM agent and a stripped toolset and frequently sorts newest.
    name: ["al2023-ami-2023.*"],
    architecture: options?.architecture,
    description: "Amazon Linux 2023",
});
const amazonLinux2Options = (options) => ({
    owners: ["amazon"],
    name: ["amzn2-ami-hvm-*-*-gp2"],
    architecture: options?.architecture,
    description: "Amazon Linux 2",
});
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
export const amazonLinux2023 = (options) => image(amazonLinux2023Options(options));
/**
 * Resolve the latest Amazon Linux 2 AMI ID for the current region as an
 * `Output<string>`.
 */
export const amazonLinux2 = (options) => image(amazonLinux2Options(options));
/**
 * Resolve the newest public Amazon Linux AMI as an `Output<string>`,
 * preferring Amazon Linux 2023 and falling back to Amazon Linux 2. Dies if
 * neither is available.
 */
export const amazonLinux = (options) => getAmi(amazonLinux2023Options(options)).pipe(Output.flatMap((al2023) => al2023?.ImageId
    ? Output.literal(al2023.ImageId)
    : requireImageId({
        ...amazonLinux2Options(options),
        description: "a public Amazon Linux AMI",
    })));
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
export const ubuntu2404 = (options) => image({
    owners: ["099720109477"],
    name: [
        "ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-*-server-*",
        "ubuntu/images/hvm-ssd/ubuntu-noble-24.04-*-server-*",
    ],
    architecture: options?.architecture,
    description: "Ubuntu 24.04 LTS",
});
/**
 * Resolve the latest Canonical Ubuntu 22.04 LTS AMI ID for the current
 * region as an `Output<string>`.
 */
export const ubuntu2204 = (options) => image({
    owners: ["099720109477"],
    name: [
        "ubuntu/images/hvm-ssd-gp3/ubuntu-jammy-22.04-*-server-*",
        "ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-*-server-*",
    ],
    architecture: options?.architecture,
    description: "Ubuntu 22.04 LTS",
});
//# sourceMappingURL=Image.js.map