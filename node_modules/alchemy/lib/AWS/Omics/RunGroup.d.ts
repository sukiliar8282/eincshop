import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface RunGroupProps {
    /**
     * A name for the run group. If omitted, a unique name is generated from the
     * app, stage, and logical ID. Mutable.
     */
    name?: string;
    /**
     * The maximum number of vCPUs that can run concurrently across all active
     * runs in the group. Mutable.
     */
    maxCpus?: number;
    /**
     * The maximum number of concurrent runs for the group. Mutable.
     */
    maxRuns?: number;
    /**
     * The maximum time for each run in the group, e.g. `"10 hours"` or
     * `Duration.minutes(600)`. Sent to the API as whole minutes (a bare
     * number is milliseconds). Mutable.
     */
    maxDuration?: Duration.Input;
    /**
     * The maximum number of GPUs that can run concurrently across all active
     * runs in the group. Mutable.
     */
    maxGpus?: number;
    /**
     * Tags to apply to the run group. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface RunGroup extends Resource<"AWS.Omics.RunGroup", RunGroupProps, {
    /**
     * ID of the run group.
     */
    runGroupId: string;
    /**
     * ARN of the run group.
     */
    runGroupArn: string;
    /**
     * Name of the run group.
     */
    name: string;
}, never, Providers> {
}
/**
 * An Amazon HealthOmics run group — a resource-limit envelope for workflow
 * runs. A run group caps the vCPUs, GPUs, concurrent runs, and per-run
 * duration for the workflow runs assigned to it.
 *
 * A run group name is auto-generated from the app, stage, and logical ID
 * unless you provide one. All limits are mutable in place.
 * ### Creating a Run Group
 * **Example:** Basic Run Group
 * ```typescript
 * import * as Omics from "alchemy/AWS/Omics";
 *
 * const group = yield* Omics.RunGroup("Batch");
 * ```
 *
 * **Example:** Run Group with Limits
 * ```typescript
 * const group = yield* Omics.RunGroup("Batch", {
 *   name: "nightly-batch",
 *   maxCpus: 100,
 *   maxRuns: 10,
 *   maxDuration: "10 hours",
 * });
 * ```
 *
 * @resource
 */
export declare const RunGroup: import("../../Resource.ts").ResourceClass<RunGroup>;
export declare const RunGroupProvider: () => import("effect/Layer").Layer<Provider.Provider<RunGroup>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=RunGroup.d.ts.map