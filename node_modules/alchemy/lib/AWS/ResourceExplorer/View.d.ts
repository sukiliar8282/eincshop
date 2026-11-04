import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ViewProps {
    /**
     * Name of the view. Can include letters, digits, and the dash character
     * (up to 64 characters), and must be unique within the region.
     * @default ${app}-${stage}-${id}
     */
    viewName?: string;
    /**
     * A Resource Explorer search filter that scopes every query made through
     * this view, e.g. `"service:s3"` or `"tag:stage=prod"`. Results of a
     * search are the intersection of the query and this filter.
     * Omit to leave the view unfiltered.
     */
    filterString?: string;
    /**
     * Additional resource properties to include in search results returned
     * by this view. `"tags"` is the only supported property today.
     */
    includedProperties?: string[];
    /**
     * The root ARN the view is scoped to. Defaults to the account
     * (`arn:aws:iam::<account>:root`). Changing the scope requires
     * replacement — the API offers no scope update.
     */
    scope?: string;
    /**
     * Tags to apply to the view. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
/** @resource */
export interface View extends Resource<"AWS.ResourceExplorer.View", ViewProps, {
    /** ARN of the view, e.g. `arn:aws:resource-explorer-2:us-west-2:123456789012:view/my-view/uuid`. */
    viewArn: string;
    /** Name of the view. */
    viewName: string;
    /** The root ARN the view is scoped to. */
    scope: string | undefined;
}, never, Providers> {
}
/**
 * An AWS Resource Explorer view — a saved search lens with an optional
 * filter and a set of included properties that `Search` queries run
 * through.
 *
 * Views require an active `AWS.ResourceExplorer.Index` in the region.
 * When an index and a view deploy together, the view provider retries
 * through the window where the index is still provisioning.
 *
 * ### Creating Views
 * **Example:** Unfiltered view over the whole account
 * ```typescript
 * const index = yield* AWS.ResourceExplorer.Index("Index", {});
 * const view = yield* AWS.ResourceExplorer.View("AllResources", {});
 * ```
 *
 * **Example:** Filtered view with tags included in results
 * ```typescript
 * const view = yield* AWS.ResourceExplorer.View("S3Only", {
 *   filterString: "service:s3",
 *   includedProperties: ["tags"],
 * });
 * ```
 *
 * ### Searching
 * **Example:** Search from a Lambda function
 * ```typescript
 * // init
 * const search = yield* AWS.ResourceExplorer.Search(view);
 *
 * return {
 *   fetch: Effect.gen(function* () {
 *     // runtime
 *     const results = yield* search({ QueryString: "service:s3" });
 *     return HttpServerResponse.json({ count: results.Count });
 *   }),
 * };
 * ```
 */
declare const ViewResource: import("../../Resource.ts").ResourceClass<View>;
export { ViewResource as View };
declare const ViewUnobservable_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "ResourceExplorerViewUnobservable";
} & Readonly<A>;
/**
 * Raised when a view can neither be created (a peer holds the name) nor
 * observed afterwards — i.e. reconciliation raced a concurrent delete.
 */
export declare class ViewUnobservable extends ViewUnobservable_base<{
    message: string;
}> {
}
export declare const ViewProvider: () => import("effect/Layer").Layer<Provider.Provider<View>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=View.d.ts.map