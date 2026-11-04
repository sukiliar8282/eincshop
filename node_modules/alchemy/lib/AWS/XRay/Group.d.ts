import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface GroupProps {
    /**
     * Name of the group (1-32 characters). `Default` is reserved by X-Ray for
     * the built-in group that matches all traces.
     *
     * Changing the name replaces the group.
     * @default ${app}-${stage}-${id}
     */
    groupName?: string;
    /**
     * The filter expression defining the criteria by which traces belong to
     * the group, e.g. `service("my-api") AND responsetime > 2`.
     */
    filterExpression: string;
    /**
     * Whether to enable insights for the group. Insights detect anomalies in
     * the group's traces.
     * @default false
     */
    insightsEnabled?: boolean;
    /**
     * Whether insights should generate EventBridge notifications. Requires
     * `insightsEnabled: true`.
     * @default false
     */
    notificationsEnabled?: boolean;
    /**
     * Tags to apply to the group. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Group extends Resource<"AWS.XRay.Group", GroupProps, {
    /**
     * Name of the group.
     */
    groupName: string;
    /**
     * ARN of the group.
     */
    groupArn: string;
}, never, Providers> {
}
/**
 * An AWS X-Ray group that collects traces matching a filter expression, for
 * focused service maps, analytics, and insights.
 * ### Creating Groups
 * **Example:** Group traces for one service
 * ```typescript
 * import * as XRay from "alchemy/AWS/XRay";
 *
 * const group = yield* XRay.Group("ApiGroup", {
 *   filterExpression: 'service("my-api")',
 * });
 * ```
 *
 * **Example:** Group slow requests with insights enabled
 * ```typescript
 * const group = yield* XRay.Group("SlowRequests", {
 *   filterExpression: "responsetime > 2",
 *   insightsEnabled: true,
 *   notificationsEnabled: true,
 * });
 * ```
 *
 * @resource
 */
export declare const Group: import("../../Resource.ts").ResourceClass<Group>;
declare const XRayReservedGroupName_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "XRayReservedGroupName";
} & Readonly<A>;
/**
 * Raised when a `Group` is configured with the reserved group name
 * `Default`, which X-Ray uses for the built-in group matching all traces.
 */
export declare class XRayReservedGroupName extends XRayReservedGroupName_base<{
    message: string;
}> {
}
export declare const GroupProvider: () => import("effect/Layer").Layer<Provider.Provider<Group>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=Group.d.ts.map