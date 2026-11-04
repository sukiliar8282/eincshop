import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ScheduleGroupProps {
    /**
     * Schedule group name. If omitted, Alchemy generates a deterministic name.
     */
    name?: string;
    /**
     * User-defined tags for the schedule group.
     */
    tags?: Record<string, string>;
}
/**
 * An EventBridge Scheduler schedule group.
 *
 * Schedule groups provide a namespace for schedules so higher-level helpers can
 * organize recurring jobs separately from one-shot or operational schedules.
 * ### Creating Schedule Groups
 * **Example:** Basic Group
 * ```typescript
 * const group = yield* ScheduleGroup("Operations", {
 *   tags: {
 *     domain: "ops",
 *   },
 * });
 * ```
 *
 * @resource
 */
export interface ScheduleGroup extends Resource<"AWS.Scheduler.ScheduleGroup", ScheduleGroupProps, {
    /**
     * ARN of the schedule group.
     */
    scheduleGroupArn: string;
    /**
     * Name of the schedule group.
     */
    scheduleGroupName: string;
    /**
     * Current state of the schedule group (`ACTIVE` or `DELETING`).
     */
    state: string | undefined;
}, never, Providers> {
}
export declare const ScheduleGroup: import("../../Resource.ts").ResourceClass<ScheduleGroup>;
export declare const ScheduleGroupProvider: () => import("effect/Layer").Layer<Provider.Provider<ScheduleGroup>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ScheduleGroup.d.ts.map