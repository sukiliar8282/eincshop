import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
export interface ComponentVersionProps {
    /**
     * The inline component recipe, as a JSON or YAML string. The recipe defines
     * the component's name (`ComponentName`), version (`ComponentVersion`),
     * lifecycle, and platform capability.
     *
     * Component versions are immutable — changing the recipe replaces the
     * component version.
     */
    recipe: string;
    /**
     * Tags to apply to the component version. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface ComponentVersion extends Resource<"AWS.GreengrassV2.ComponentVersion", ComponentVersionProps, {
    /** The ARN of this component version. */
    arn: string;
    /** The name of the component. */
    componentName: string;
    /** The semantic version of the component. */
    componentVersion: string;
}, never, Providers> {
}
/**
 * An IoT Greengrass V2 component version created from an inline recipe.
 * Components are software modules that run on Greengrass core devices.
 *
 * Component versions are immutable in the cloud: any change to the recipe
 * replaces the component version (a new name/version pair is registered and
 * the previous one is deleted). Only tags are mutable in place.
 *
 * ### Creating Component Versions
 * **Example:** Component from an inline JSON recipe
 * ```typescript
 * import * as GreengrassV2 from "alchemy/AWS/GreengrassV2";
 *
 * const component = yield* GreengrassV2.ComponentVersion("Hello", {
 *   recipe: JSON.stringify({
 *     RecipeFormatVersion: "2020-01-25",
 *     ComponentName: "com.example.Hello",
 *     ComponentVersion: "1.0.0",
 *     ComponentDescription: "Prints a greeting",
 *     ComponentPublisher: "Example",
 *     Manifests: [
 *       {
 *         Platform: { os: "linux" },
 *         Lifecycle: { run: "echo hello" },
 *       },
 *     ],
 *   }),
 * });
 * ```
 *
 * **Example:** Tagged component version
 * ```typescript
 * const component = yield* GreengrassV2.ComponentVersion("Hello", {
 *   recipe,
 *   tags: { team: "edge" },
 * });
 * ```
 *
 * @resource
 */
export declare const ComponentVersion: import("../../Resource.ts").ResourceClass<ComponentVersion>;
declare const GreengrassInvalidRecipe_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "GreengrassInvalidRecipe";
} & Readonly<A>;
/**
 * Raised when the inline recipe does not declare a `ComponentName` and
 * `ComponentVersion` that Alchemy can derive the component identity from.
 */
export declare class GreengrassInvalidRecipe extends GreengrassInvalidRecipe_base<{
    message: string;
}> {
}
declare const GreengrassComponentFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "GreengrassComponentFailed";
} & Readonly<A>;
/**
 * Raised when the cloud reports the component version entered the `FAILED`
 * or `DEPRECATED` state instead of becoming `DEPLOYABLE`.
 */
export declare class GreengrassComponentFailed extends GreengrassComponentFailed_base<{
    message: string;
}> {
}
declare const GreengrassComponentNotReady_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "GreengrassComponentNotReady";
} & Readonly<A>;
/**
 * Internal signal used to poll a freshly created component version until the
 * cloud marks it `DEPLOYABLE`.
 */
export declare class GreengrassComponentNotReady extends GreengrassComponentNotReady_base<{
    message: string;
}> {
}
export declare const ComponentVersionProvider: () => import("effect/Layer").Layer<Provider.Provider<ComponentVersion>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=ComponentVersion.d.ts.map