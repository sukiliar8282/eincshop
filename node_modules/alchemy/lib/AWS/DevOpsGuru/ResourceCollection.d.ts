import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface TagAppBoundary {
    /**
     * Tag key that defines an application boundary. DevOps Guru requires the
     * key to begin with `devops-guru-` (any casing, e.g.
     * `DevOps-Guru-deployment-application`).
     */
    appBoundaryKey: string;
    /**
     * Tag values that select the resources to analyze. Use `["*"]` to match
     * every resource carrying the key.
     */
    tagValues: string[];
}
export interface ResourceCollectionProps {
    /**
     * Analyze resources belonging to the named CloudFormation stacks. Use
     * `{ stackNames: ["*"] }` to analyze every stack in the account. Mutually
     * exclusive with `tags` — an account's collection uses one filter type at
     * a time.
     */
    cloudFormation?: {
        /** CloudFormation stack names to analyze (`["*"]` for all stacks). */
        stackNames: string[];
    };
    /**
     * Analyze resources carrying the given app-boundary tags. Tag keys must
     * begin with `devops-guru-` (any casing). Mutually exclusive with
     * `cloudFormation`.
     */
    tags?: TagAppBoundary[];
}
export interface ResourceCollection extends Resource<"AWS.DevOpsGuru.ResourceCollection", ResourceCollectionProps, {
    /** CloudFormation stack names DevOps Guru analyzes. */
    cloudFormationStackNames: string[];
    /** App-boundary tag filters DevOps Guru analyzes. */
    tags: TagAppBoundary[];
}, never, Providers> {
}
/**
 * The DevOps Guru resource collection — the account/region singleton that
 * defines which AWS resources DevOps Guru analyzes for operational insights,
 * either by CloudFormation stack or by app-boundary tag. Configuring a
 * collection is what "enables" DevOps Guru analysis in an account.
 *
 * An account has exactly one collection, so this resource is a
 * capture-and-restore singleton: adopting a collection that Alchemy did not
 * configure requires `--adopt`.
 *
 * ### Defining Coverage
 * **Example:** Analyze specific CloudFormation stacks
 * ```typescript
 * const collection = yield* DevOpsGuru.ResourceCollection("Coverage", {
 *   cloudFormation: { stackNames: ["my-app-prod"] },
 * });
 * ```
 *
 * **Example:** Analyze every stack in the account
 * ```typescript
 * const collection = yield* DevOpsGuru.ResourceCollection("Coverage", {
 *   cloudFormation: { stackNames: ["*"] },
 * });
 * ```
 *
 * **Example:** Analyze resources by app-boundary tag
 * ```typescript
 * const collection = yield* DevOpsGuru.ResourceCollection("Coverage", {
 *   tags: [
 *     { appBoundaryKey: "devops-guru-app", tagValues: ["checkout", "billing"] },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export declare const ResourceCollection: import("../../Resource.ts").ResourceClass<ResourceCollection>;
export declare const ResourceCollectionProvider: () => import("effect/Layer").Layer<Provider.Provider<ResourceCollection>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ResourceCollection.d.ts.map