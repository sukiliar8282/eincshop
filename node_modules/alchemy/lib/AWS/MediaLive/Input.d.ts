import * as medialive from "@distilled.cloud/aws/medialive";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface InputProps {
    /**
     * Name of the input. If omitted, a unique name is generated from the app,
     * stage, and logical ID. Names are mutable — changing the name updates the
     * input in place.
     */
    name?: string;
    /**
     * The input type (e.g. `RTMP_PUSH`, `URL_PULL`, `MEDIACONNECT`,
     * `MP4_FILE`). Changing the type replaces the input.
     */
    type: medialive.InputType;
    /**
     * Destination settings for PUSH-type inputs — e.g. the application/stream
     * name pair for `RTMP_PUSH` (`{ StreamName: "live/stream" }`).
     */
    destinations?: medialive.InputDestinationRequest[];
    /**
     * Source URLs for PULL-type inputs (`URL_PULL`, `RTMP_PULL`, `MP4_FILE`,
     * `TS_FILE`), with optional basic-auth credentials.
     */
    sources?: medialive.InputSourceRequest[];
    /**
     * IDs of input security groups to attach. Required for PUSH-type inputs
     * that ingest over the public internet.
     */
    inputSecurityGroups?: string[];
    /**
     * MediaConnect flows to use as the input source (for `MEDIACONNECT`
     * inputs).
     */
    mediaConnectFlows?: medialive.MediaConnectFlowRequest[];
    /**
     * ARN of the IAM role MediaLive assumes to access the input (required for
     * VPC and MediaConnect inputs).
     */
    roleArn?: string;
    /**
     * VPC settings for a VPC push input. Changing the VPC settings replaces
     * the input.
     */
    vpc?: medialive.InputVpcRequest;
    /**
     * User-defined tags for the input.
     */
    tags?: Record<string, string>;
}
export interface Input extends Resource<"AWS.MediaLive.Input", InputProps, {
    /** Server-assigned unique id of the input. */
    inputId: string;
    /** ARN of the input. */
    inputArn: string;
    /** Name of the input. */
    inputName: string | undefined;
    /** Current lifecycle state (e.g. `DETACHED`, `ATTACHED`). */
    state: medialive.InputState | undefined;
    /** The input type (e.g. `RTMP_PUSH`, `URL_PULL`). */
    type: medialive.InputType | undefined;
    /** `STANDARD` (two ingest endpoints) or `SINGLE_PIPELINE`. */
    inputClass: medialive.InputClass | undefined;
    /** Resolved ingest destinations (push URLs) for the input. */
    destinations: medialive.InputDestination[];
    /** IDs of the attached input security groups. */
    securityGroups: string[];
}, never, Providers> {
}
/**
 * An AWS Elemental MediaLive input — the ingest endpoint or source locator a
 * channel reads live content from (RTMP/RTP push, HLS/MP4 pull,
 * MediaConnect flow, ...).
 *
 * ### Creating Inputs
 * **Example:** RTMP push input behind an allowlist
 * ```typescript
 * const isg = yield* MediaLive.InputSecurityGroup("Allowlist", {
 *   whitelistRules: ["0.0.0.0/0"],
 * });
 * const input = yield* MediaLive.Input("Stream", {
 *   type: "RTMP_PUSH",
 *   inputSecurityGroups: [isg.inputSecurityGroupId],
 *   destinations: [{ StreamName: "live/stream" }],
 * });
 * ```
 *
 * **Example:** HLS pull input
 * ```typescript
 * const input = yield* MediaLive.Input("Vod", {
 *   type: "URL_PULL",
 *   sources: [{ Url: "https://example.com/stream/index.m3u8" }],
 * });
 * ```
 *
 * ### Attaching to a Channel
 * **Example:** Feed a channel
 * ```typescript
 * const channel = yield* MediaLive.Channel("Live", {
 *   roleArn: role.roleArn,
 *   inputAttachments: [
 *     { InputId: input.inputId, InputAttachmentName: "primary" },
 *   ],
 *   encoderSettings,
 *   destinations,
 * });
 * ```
 *
 * @resource
 */
export declare const Input: import("../../Resource.ts").ResourceClass<Input>;
export declare const InputProvider: () => import("effect/Layer").Layer<Provider.Provider<Input>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Input.d.ts.map