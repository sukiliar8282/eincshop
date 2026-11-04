import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ChannelGroupProps {
    /**
     * Name of the channel group. Must be unique within the account/region and
     * match `^[a-zA-Z0-9_-]+$`. If omitted, a unique name is generated.
     * Changing the name replaces the channel group.
     */
    channelGroupName?: string;
    /**
     * Optional description of the channel group (up to 1024 characters).
     */
    description?: string;
    /**
     * User-defined tags for the channel group. Merged with internal Alchemy
     * tags.
     */
    tags?: Record<string, string>;
}
export interface ChannelGroup extends Resource<"AWS.MediaPackageV2.ChannelGroup", ChannelGroupProps, {
    /** Name of the channel group. */
    channelGroupName: string;
    /** ARN of the channel group. */
    channelGroupArn: string;
    /** Shared egress domain that serves all origin endpoints in the group. */
    egressDomain: string;
}, never, Providers> {
}
/**
 * An AWS Elemental MediaPackage v2 channel group — the top-level container
 * for channels and origin endpoints. All channels and origin endpoints in a
 * group share one egress domain, giving downstream players and CDNs
 * predictable URLs for stream delivery.
 *
 * ### Creating a Channel Group
 * **Example:** Basic Channel Group
 * ```typescript
 * import * as MediaPackageV2 from "alchemy/AWS/MediaPackageV2";
 *
 * const group = yield* MediaPackageV2.ChannelGroup("Live");
 * ```
 *
 * **Example:** Channel Group with Description and Tags
 * ```typescript
 * const group = yield* MediaPackageV2.ChannelGroup("Live", {
 *   description: "Live sports streams",
 *   tags: { team: "media" },
 * });
 * ```
 *
 * ### Egress Domain
 * **Example:** Use the shared egress domain
 * ```typescript
 * const group = yield* MediaPackageV2.ChannelGroup("Live");
 * // e.g. abcde.egress.xyz.mediapackagev2.us-east-1.amazonaws.com
 * const domain = group.egressDomain;
 * ```
 *
 * @resource
 */
export declare const ChannelGroup: import("../../Resource.ts").ResourceClass<ChannelGroup>;
export declare const ChannelGroupProvider: () => import("effect/Layer").Layer<Provider.Provider<ChannelGroup>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ChannelGroup.d.ts.map