import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface RoomMessageReviewHandler {
    /**
     * ARN of the Lambda function that reviews messages before they are
     * delivered to the room.
     */
    uri?: string;
    /**
     * What happens to a message if the review handler errors or times out:
     * `ALLOW` delivers it, `DENY` drops it.
     * @default "ALLOW"
     */
    fallbackResult?: "ALLOW" | "DENY";
}
/**
 * The binding contract of a room: the message review event source
 * (`IVSChat.onReviewMessage`) contributes the reviewing Lambda's ARN as the
 * room's `messageReviewHandler`, which the provider merges with
 * `props.messageReviewHandler` and syncs onto the room.
 */
export interface RoomBinding {
    /** Review handler injected by `IVSChat.onReviewMessage`. */
    messageReviewHandler?: RoomMessageReviewHandler;
}
export interface RoomProps {
    /**
     * Name of the room (not unique). If omitted, a deterministic physical
     * name is generated. Room names are mutable — changing the name
     * updates the room in place.
     */
    roomName?: string;
    /**
     * Maximum number of messages per second that can be sent to the room
     * (`1` - `10`).
     * @default 10
     */
    maximumMessageRatePerSecond?: number;
    /**
     * Maximum number of characters in a single message (`1` - `500`).
     * @default 500
     */
    maximumMessageLength?: number;
    /**
     * A Lambda-backed handler that reviews (and can modify or deny)
     * messages before delivery. Prefer wiring it through
     * `IVSChat.onReviewMessage` — the event source also creates the invoke
     * Permission and registers the runtime handler.
     * @default no review handler
     */
    messageReviewHandler?: RoomMessageReviewHandler;
    /**
     * ARNs or IDs of `LoggingConfiguration`s that record the room's chat
     * messages.
     */
    loggingConfigurationIdentifiers?: string[];
    /**
     * Tags to apply to the room. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Room extends Resource<"AWS.IVSChat.Room", RoomProps, {
    /**
     * The room's physical name.
     */
    roomName: string;
    /**
     * ARN of the room.
     */
    roomArn: string;
    /**
     * Unique ID of the room.
     */
    roomId: string;
}, RoomBinding, Providers> {
}
/**
 * An Amazon IVS Chat room — a virtual space where chat participants
 * exchange messages over WebSocket connections.
 *
 * Clients connect with chat tokens minted at runtime via
 * `CreateChatToken`; message rate/length limits, a Lambda review handler,
 * and logging configurations are all managed on the room.
 * ### Creating Rooms
 * **Example:** Basic Room
 * ```typescript
 * import * as IVSChat from "alchemy/AWS/IVSChat";
 *
 * const room = yield* IVSChat.Room("LiveChat");
 * ```
 *
 * **Example:** Room with Message Limits
 * ```typescript
 * const room = yield* IVSChat.Room("LiveChat", {
 *   maximumMessageRatePerSecond: 5,
 *   maximumMessageLength: 200,
 * });
 * ```
 *
 * ### Logging
 * **Example:** Room with Chat Logging
 * ```typescript
 * const logging = yield* IVSChat.LoggingConfiguration("ChatLogs", {
 *   destinationConfiguration: {
 *     cloudWatchLogs: { logGroupName: logGroup.logGroupName },
 *   },
 * });
 * const room = yield* IVSChat.Room("LiveChat", {
 *   loggingConfigurationIdentifiers: [logging.loggingConfigurationArn],
 * });
 * ```
 *
 * ### Message Review
 * **Example:** Review Messages with a Lambda Handler
 * ```typescript
 * // inside a Lambda Function's effect — the handler reviews every message
 * // sent to the room before delivery (allow / modify / deny)
 * const room = yield* IVSChat.Room("LiveChat");
 * yield* IVSChat.onReviewMessage(room, (event) =>
 *   Effect.succeed(
 *     event.Content.includes("banned-word")
 *       ? { ReviewResult: "DENY", Attributes: { Reason: "moderated" } }
 *       : undefined,
 *   ),
 * );
 * // on the Function effect:
 * // .pipe(Effect.provide(Lambda.RoomMessageReviewEventSource))
 * ```
 *
 * @resource
 */
export declare const Room: import("../../Resource.ts").ResourceClass<Room>;
declare const IvsChatRoomIncomplete_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "IvsChatRoomIncomplete";
} & Readonly<A>;
/**
 * Raised when the IVS Chat API returns a room missing its ARN, ID, or
 * name.
 */
export declare class IvsChatRoomIncomplete extends IvsChatRoomIncomplete_base<{
    message: string;
}> {
}
declare const ConflictingRoomMessageReviewHandler_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "ConflictingRoomMessageReviewHandler";
} & Readonly<A>;
/**
 * Two different Lambda functions were registered as the same room's message
 * review handler — IVS Chat supports exactly one handler per room.
 */
export declare class ConflictingRoomMessageReviewHandler extends ConflictingRoomMessageReviewHandler_base<{
    readonly uris: readonly string[];
}> {
}
export declare const RoomProvider: () => import("effect/Layer").Layer<Provider.Provider<Room>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=Room.d.ts.map