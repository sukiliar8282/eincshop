import * as Layer from "effect/Layer";
import { RoomMessageReviewEventSource as IVSChatRoomMessageReviewEventSource, type RoomMessageEvent } from "../IVSChat/RoomMessageReviewEventSource.ts";
import * as Lambda from "./Function.ts";
/**
 * An IVS Chat message review invocation — the PascalCase
 * `Content`/`MessageId`/`RoomArn` envelope IVS Chat sends the handler for
 * every `SendMessage` request.
 */
export declare const isRoomMessageEvent: (event: any) => event is RoomMessageEvent;
/**
 * Connects an IVS Chat room's message review handler to the current Lambda
 * function.
 *
 * At deploy time this layer injects the function ARN into the room's
 * `messageReviewHandler` through the room's binding contract and
 * materializes the `lambda:InvokeFunction` Permission for
 * `ivschat.amazonaws.com`; at runtime it dispatches review invocations
 * (matched on `RoomArn`) to the registered handler and returns the verdict
 * to IVS Chat.
 * ### Reviewing room messages
 * **Example:** Deny messages containing a banned word
 * ```typescript
 * yield* IVSChat.onReviewMessage(room, (event) =>
 *   Effect.succeed(
 *     event.Content.includes("banned-word")
 *       ? { ReviewResult: "DENY", Attributes: { Reason: "moderated" } }
 *       : undefined,
 *   ),
 * );
 * ```
 *
 * @binding
 */
export declare const RoomMessageReviewEventSource: Layer.Layer<IVSChatRoomMessageReviewEventSource, never, Lambda.Function>;
//# sourceMappingURL=RoomMessageReviewEventSource.d.ts.map