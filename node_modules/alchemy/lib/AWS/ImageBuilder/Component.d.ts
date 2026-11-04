import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
declare const ComponentSourceInvalid_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "AWS::ImageBuilder::ComponentSourceInvalid";
} & Readonly<A>;
/**
 * A Component must define its document inline (`data`) or point at an S3
 * object (`uri`) — exactly one of the two.
 */
export declare class ComponentSourceInvalid extends ComponentSourceInvalid_base<{
    message: string;
}> {
}
declare const ComponentVersionImmutable_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "AWS::ImageBuilder::ComponentVersionImmutable";
} & Readonly<A>;
/**
 * Image Builder component versions are immutable — the deployed document
 * differs from the desired one but the semantic version was not bumped, so
 * the cloud state cannot be converged.
 */
export declare class ComponentVersionImmutable extends ComponentVersionImmutable_base<{
    message: string;
}> {
}
export interface ComponentProps {
    /**
     * Name of the component. If omitted, a deterministic physical name is
     * generated. Changing the name replaces the component.
     */
    componentName?: string;
    /**
     * Semantic version of the component (`major.minor.patch`). Components
     * are immutable — bump the version when changing `data`/`uri`. Changing
     * the version replaces the component.
     * @default "1.0.0"
     */
    semanticVersion?: string;
    /**
     * Operating system platform of the component. Changing the platform
     * replaces the component.
     */
    platform: "Linux" | "Windows" | "macOS";
    /**
     * Inline YAML component document (AWSTOMC schema) defining the build /
     * validate / test phases. Mutually exclusive with `uri`. Changing the
     * data replaces the component.
     */
    data?: string;
    /**
     * S3 URI of a YAML component document. Use for documents larger than
     * 64 KB. Mutually exclusive with `data`. Changing the URI replaces the
     * component.
     */
    uri?: string;
    /**
     * Description of the component. Changing the description replaces the
     * component (component versions are immutable).
     */
    description?: string;
    /**
     * Description of the change in this version compared to the previous
     * one. Changing it replaces the component.
     */
    changeDescription?: string;
    /**
     * Operating system versions supported by the component
     * (e.g. `["Amazon Linux 2023"]`). Changing them replaces the component.
     */
    supportedOsVersions?: string[];
    /**
     * KMS key used to encrypt the component. Changing it replaces the
     * component.
     */
    kmsKeyId?: string;
    /**
     * User-defined tags for the component.
     */
    tags?: Record<string, string>;
}
export interface Component extends Resource<"AWS.ImageBuilder.Component", ComponentProps, {
    /** The name of the component. */
    componentName: string;
    /** The ARN of this component build version. */
    componentBuildVersionArn: string;
    /** The semantic version of the component. */
    semanticVersion: string;
    /** The OS platform of the component (`Linux` / `Windows`). */
    platform: string;
    /** Whether the component is a `BUILD` or `TEST` component. */
    type: string | undefined;
    /** When the component was created. */
    dateCreated: string | undefined;
}, never, Providers> {
}
/**
 * An EC2 Image Builder component — a YAML document that defines the build,
 * validation, and test steps applied to an instance during image creation.
 *
 * Components are immutable versions: every property except `tags` replaces
 * the component. Bump `semanticVersion` when changing the document.
 * ### Creating a Component
 * **Example:** Inline Build Component
 * ```typescript
 * const component = yield* ImageBuilder.Component("Setup", {
 *   platform: "Linux",
 *   semanticVersion: "1.0.0",
 *   data: [
 *     "name: setup",
 *     "description: install packages",
 *     "schemaVersion: 1.2",
 *     "phases:",
 *     "  - name: build",
 *     "    steps:",
 *     "      - name: install",
 *     "        action: ExecuteBash",
 *     "        inputs:",
 *     "          commands:",
 *     "            - dnf install -y htop",
 * ].join("\n"),
 * });
 * ```
 *
 * ### Using in an Image Recipe
 * **Example:** Reference from a Recipe
 * ```typescript
 * const recipe = yield* ImageBuilder.ImageRecipe("Recipe", {
 *   parentImage: "arn:aws:imagebuilder:us-west-2:aws:image/amazon-linux-2023-x86/x.x.x",
 *   components: [{ componentArn: component.componentBuildVersionArn }],
 * });
 * ```
 *
 * @resource
 */
export declare const Component: import("../../Resource.ts").ResourceClass<Component>;
export declare const ComponentProvider: () => import("effect/Layer").Layer<Provider.Provider<Component>, never, import("../Environment.ts").AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=Component.d.ts.map