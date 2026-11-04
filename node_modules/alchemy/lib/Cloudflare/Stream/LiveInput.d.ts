import * as stream from "@distilled.cloud/cloudflare/stream";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Stream.LiveInput";
type TypeId = typeof TypeId;
/**
 * Recording behavior of a live input.
 */
export type LiveInputRecording = {
    /**
     * Origins allowed to display videos created from this live input.
     * Enter allowed origin domains in an array, e.g. `["example.com"]`.
     */
    allowedOrigins?: string[];
    /**
     * Disables reporting the number of live viewers when this is set to
     * `true`.
     * @default false
     */
    hideLiveViewerCount?: boolean;
    /**
     * Specifies the recording behavior for the live input. `off` prevents
     * the input from being recorded; `automatic` records the input as a
     * Cloudflare Stream video whenever a stream is live.
     * @default "off"
     */
    mode?: "off" | "automatic";
    /**
     * Indicates if signed URL tokens are required to view the recorded
     * video.
     * @default false
     */
    requireSignedURLs?: boolean;
    /**
     * Number of seconds the live input is considered live after the
     * broadcast stops, before the recording transitions to on-demand.
     * @default 0
     */
    timeoutSeconds?: number;
};
export type LiveInputProps = {
    /**
     * Sets the creator ID associated with this live input. Mutable.
     */
    defaultCreator?: string;
    /**
     * Number of days after which the live input's recordings are deleted.
     * The minimum accepted value is 30. Omit to retain recordings
     * indefinitely. Mutable.
     */
    deleteRecordingAfterDays?: number;
    /**
     * Whether the live input is enabled and can accept streams. Mutable.
     * @default true
     */
    enabled?: boolean;
    /**
     * A user modifiable key-value store used to reference other systems of
     * record for managing live inputs. By convention, set a `name` field
     * for display in the Cloudflare dashboard. If omitted, a `name`
     * derived from the app, stage, and logical ID is used. Mutable.
     * @default { name: ${app}-${stage}-${id} }
     */
    meta?: Record<string, unknown>;
    /**
     * Records the input to a Cloudflare Stream video when set to
     * `automatic` mode. Mutable.
     * @default { mode: "off" }
     */
    recording?: LiveInputRecording;
};
export type LiveInputAttributes = {
    /**
     * The unique identifier for the live input (Cloudflare `uid`).
     */
    liveInputId: string;
    /**
     * The Cloudflare account the live input belongs to.
     */
    accountId: string;
    /**
     * The date and time the live input was created.
     */
    created: string | undefined;
    /**
     * The date and time the live input was last modified.
     */
    modified: string | undefined;
    /**
     * Whether the live input is enabled and can accept streams.
     */
    enabled: boolean;
    /**
     * Number of days after which the live input's recordings are deleted,
     * if configured.
     */
    deleteRecordingAfterDays: number | undefined;
    /**
     * The user-modifiable key-value store associated with the live input.
     */
    meta: Record<string, unknown>;
};
export type LiveInput = Resource<TypeId, LiveInputProps, LiveInputAttributes, never, Providers>;
/**
 * A Cloudflare Stream live input — an ingest endpoint (RTMPS/SRT/WebRTC)
 * that accepts live video and optionally records it as a Stream video.
 *
 * Live inputs are identified by an auto-assigned `uid`; every prop is
 * mutable in place via Cloudflare's PUT endpoint, so the resource is
 * never replaced. Deleting a live input does not delete videos already
 * recorded from it.
 *
 * Requires the Stream subscription to be enabled on the account.
 * ### Creating a live input
 * **Example:** Basic live input
 * ```typescript
 * const input = yield* Cloudflare.Stream.LiveInput("Broadcast", {});
 * ```
 *
 * **Example:** Live input with automatic recording
 * ```typescript
 * const input = yield* Cloudflare.Stream.LiveInput("Broadcast", {
 *   meta: { name: "town-hall" },
 *   recording: {
 *     mode: "automatic",
 *     timeoutSeconds: 10,
 *   },
 *   deleteRecordingAfterDays: 30,
 * });
 * ```
 *
 * ### Managing a live input
 * **Example:** Disable ingest without deleting the input
 * ```typescript
 * const input = yield* Cloudflare.Stream.LiveInput("Broadcast", {
 *   enabled: false,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/stream/stream-live/
 *
 * @resource
 * @product Stream
 * @category Media
 */
export declare const LiveInput: import("../../Resource.ts").ResourceClass<LiveInput>;
/**
 * Returns true if the given value is a LiveInput resource.
 */
export declare const isLiveInput: (value: unknown) => value is LiveInput;
export declare const LiveInputProvider: () => import("effect/Layer").Layer<Provider.Provider<LiveInput>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | stream.CloudflareOpContext>;
export {};
//# sourceMappingURL=LiveInput.d.ts.map