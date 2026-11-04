import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface GroupProps {
    /**
     * Name of the group. Must match `^[0-9a-zA-Z_-]+$` and be at most 64
     * characters. Group names must be unique in the account (groups are
     * global resources visible from every Region).
     * @default ${app}-${id}-${stage}-${suffix}
     */
    groupName?: string;
    /**
     * ARNs of the canaries associated with this group (as many as 10). The
     * canaries must exist in the Region the group is managed from; membership
     * is converged on every deploy (canaries added here are associated,
     * canaries removed are disassociated).
     */
    members?: string[];
    /**
     * Tags to apply to the group. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Group extends Resource<"AWS.Synthetics.Group", GroupProps, {
    /**
     * Physical name of the group.
     */
    groupName: string;
    /**
     * ARN of the group. The ARN reflects the home Region the group was
     * created in, but the group itself is a global resource.
     */
    groupArn: string;
    /**
     * Service-assigned unique ID of the group.
     */
    groupId: string;
}, never, Providers> {
}
/**
 * A CloudWatch Synthetics group — associates canaries (including
 * cross-Region canaries) so you can view aggregated run results and manage
 * them as a unit. A group can hold as many as 10 canaries, and an account
 * can have as many as 20 groups.
 * ### Creating Groups
 * **Example:** Group of Canaries
 * ```typescript
 * import * as Synthetics from "alchemy/AWS/Synthetics";
 *
 * const group = yield* Synthetics.Group("ApiCanaries", {
 *   members: [checkoutCanary.canaryArn, searchCanary.canaryArn],
 * });
 * ```
 *
 * **Example:** Empty Group with Tags
 * ```typescript
 * const group = yield* Synthetics.Group("Fleet", {
 *   tags: { team: "platform" },
 * });
 * ```
 *
 * @resource
 */
export declare const Group: import("../../Resource.ts").ResourceClass<Group>;
export declare const GroupProvider: () => import("effect/Layer").Layer<Provider.Provider<Group>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Group.d.ts.map