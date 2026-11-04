import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface InvalidationProps {
    /**
     * Distribution to invalidate.
     */
    distributionId: string;
    /**
     * Version string used as the invalidation caller reference. Change this value
     * to trigger a new invalidation.
     */
    version: string;
    /**
     * Paths to invalidate.
     * @default ["/*"]
     */
    paths?: string[];
    /**
     * Wait for the invalidation to complete.
     * @default false
     */
    wait?: boolean;
}
export interface Invalidation extends Resource<"AWS.CloudFront.Invalidation", InvalidationProps, {
    /**
     * The identifier of the invalidation batch.
     */
    invalidationId: string;
    /**
     * The distribution the invalidation ran against.
     */
    distributionId: string;
    /**
     * The version prop that triggered this invalidation batch.
     */
    version: string;
    /**
     * Current status of the invalidation (`InProgress` or `Completed`).
     */
    status: string;
    /**
     * The path patterns that were invalidated.
     */
    paths: string[];
    /**
     * When the invalidation batch was created.
     */
    createTime: Date | undefined;
}, never, Providers> {
}
/**
 * A CloudFront cache invalidation request.
 *
 * `Invalidation` is a helper resource for website deployments that need to
 * clear selected CloudFront cache paths after asset updates.
 * ### Creating Invalidations
 * **Example:** Invalidate The Entire Distribution
 * ```typescript
 * const invalidation = yield* Invalidation("WebsiteInvalidation", {
 *   distributionId: distribution.distributionId,
 *   version: files.version,
 * });
 * ```
 *
 * @resource
 */
export declare const Invalidation: import("../../Resource.ts").ResourceClass<Invalidation>;
export declare const InvalidationProvider: () => import("effect/Layer").Layer<Provider.Provider<Invalidation>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=Invalidation.d.ts.map