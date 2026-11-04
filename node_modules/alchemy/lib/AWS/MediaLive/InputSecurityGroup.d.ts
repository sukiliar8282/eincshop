import * as medialive from "@distilled.cloud/aws/medialive";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface InputSecurityGroupProps {
    /**
     * IPv4 CIDR ranges allowed to push content to inputs attached to this
     * security group (e.g. `"10.0.0.0/16"`, `"0.0.0.0/0"`).
     * @default ["0.0.0.0/0"]
     */
    whitelistRules?: string[];
    /**
     * User-defined tags for the input security group.
     */
    tags?: Record<string, string>;
}
export interface InputSecurityGroup extends Resource<"AWS.MediaLive.InputSecurityGroup", InputSecurityGroupProps, {
    /** Server-assigned unique id of the input security group. */
    inputSecurityGroupId: string;
    /** ARN of the input security group. */
    inputSecurityGroupArn: string;
    /** Current state (e.g. `IDLE`, `IN_USE`). */
    state: medialive.InputSecurityGroupState | undefined;
    /** Allowlisted source CIDR blocks. */
    whitelistRules: string[];
}, never, Providers> {
}
/**
 * An AWS Elemental MediaLive input security group — an IP allowlist that
 * gates which source networks may push content to attached PUSH inputs
 * (RTMP_PUSH, RTP_PUSH, UDP_PUSH).
 *
 * ### Creating an Input Security Group
 * **Example:** Allow a single network
 * ```typescript
 * const isg = yield* MediaLive.InputSecurityGroup("Allowlist", {
 *   whitelistRules: ["10.0.0.0/16"],
 * });
 * ```
 *
 * **Example:** Open to the world (test-only)
 * ```typescript
 * const isg = yield* MediaLive.InputSecurityGroup("Open", {
 *   whitelistRules: ["0.0.0.0/0"],
 *   tags: { team: "media" },
 * });
 * ```
 *
 * ### Attaching to an Input
 * **Example:** Gate an RTMP push input
 * ```typescript
 * const input = yield* MediaLive.Input("Stream", {
 *   type: "RTMP_PUSH",
 *   inputSecurityGroups: [isg.inputSecurityGroupId],
 *   destinations: [{ StreamName: "live/stream" }],
 * });
 * ```
 *
 * @resource
 */
export declare const InputSecurityGroup: import("../../Resource.ts").ResourceClass<InputSecurityGroup>;
export declare const InputSecurityGroupProvider: () => import("effect/Layer").Layer<Provider.Provider<InputSecurityGroup>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=InputSecurityGroup.d.ts.map