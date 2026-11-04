import * as Effect from "effect/Effect";
import * as Provider from "../../Provider.ts";
import { Resource, type ResourceClassLike } from "../../Resource.ts";
import { Stack } from "../../Stack.ts";
import { Stage } from "../../Stage.ts";
import type { Providers } from "../Providers.ts";
import type { Function } from "./Function.ts";
export interface VersionProps {
    /**
     * Managed Lambda function whose current code and versioned configuration
     * should be published.
     */
    function: Function;
}
type VersionAttributes = {
    /**
     * Name of the Lambda function this version belongs to.
     */
    functionName: string;
    /**
     * Unqualified ARN of the Lambda function.
     */
    functionArn: string;
    /**
     * Immutable version number assigned by Lambda, represented as a string.
     */
    version: string;
    /**
     * ARN qualified with this immutable version number.
     */
    versionArn: string;
    /**
     * Secret-safe fingerprint of the function ARN, code, and versioned
     * configuration.
     */
    sourceHash: string;
    /**
     * Base64-encoded SHA-256 of the published function code, as reported by
     * Lambda.
     */
    codeSha256: string;
    /**
     * SHA-256 of the post-binding, versioned Lambda configuration. Secret values
     * contribute to this digest but are never stored in state.
     */
    configSha256: string;
};
export interface Version extends Resource<"AWS.Lambda.Version", VersionProps, VersionAttributes, never, Providers> {
}
interface VersionResourceProps extends VersionProps {
    /**
     * Internal dependency on a non-stable Function attribute. Its value is not
     * the release identity; it prevents publication from racing a Function
     * update whose publishable configuration has not settled yet.
     */
    deploymentHash: string;
}
interface VersionResource extends Resource<"AWS.Lambda.Version", VersionResourceProps, VersionAttributes, never, Providers> {
}
declare const VersionResource: import("../../Resource.ts").ResourceClass<VersionResource>;
export interface VersionClass extends ResourceClassLike<Version> {
    (id: string, props: {
        function: Function;
    }): Effect.Effect<Version, never, Providers>;
    ref(id: string, options?: {
        stage?: string;
        stack?: string;
    }): Effect.Effect<Version>;
}
/**
 * An immutable numbered version of a managed Lambda function.
 *
 * The provider publishes only after the Function's code and configuration
 * have settled. Re-applying unchanged code and versioned configuration reuses
 * the existing version. Function-level operational changes, such as reserved
 * concurrency, do not publish a new version.
 *
 * Versions default to **retain** on removal. Moving or deleting an alias never
 * deletes an older version, so in-flight durable executions can continue
 * replaying against the code that started them. Use `destroy()` only when the
 * exact numbered version is safe to remove.
 *
 * ### Publishing a Version
 * **Example:** Publish a Managed Function
 * ```typescript
 * const fn = yield* AWS.Lambda.Function("Handler", {
 *   main: import.meta.resolve("./handler.ts"),
 * });
 * const version = yield* AWS.Lambda.Version("HandlerVersion", {
 *   function: fn,
 * });
 * ```
 *
 * ### Promoting with an Alias
 * **Example:** Stable Production Alias
 * ```typescript
 * const version = yield* AWS.Lambda.Version("CampaignRunVersion", {
 *   function: campaign.function,
 * });
 * const live = yield* AWS.Lambda.Alias("CampaignRunLive", {
 *   version,
 *   aliasName: "live",
 * });
 * ```
 *
 * ### Explicit Deletion
 * **Example:** Delete the Exact Version on Stack Destroy
 * ```typescript
 * import { destroy } from "alchemy/RemovalPolicy";
 *
 * const disposable = yield* AWS.Lambda.Version("PreviewVersion", {
 *   function: fn,
 * }).pipe(destroy());
 * ```
 *
 * @resource
 */
export declare const Version: VersionClass;
export declare const VersionProvider: () => import("effect/Layer").Layer<Provider.Provider<VersionResource>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | Stack | Stage>;
export {};
//# sourceMappingURL=Version.d.ts.map