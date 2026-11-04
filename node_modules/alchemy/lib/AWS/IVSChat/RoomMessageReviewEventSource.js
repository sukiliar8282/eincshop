import * as Binding from "../../Binding.js";
export const RoomMessageReviewEventSource = Binding.Service("AWS.IVSChat.RoomMessageReviewEventSource");
/**
 * Review (and optionally modify or deny) every message sent to the room
 * with the current Lambda function.
 *
 * Provide `Lambda.RoomMessageReviewEventSource` on the hosting function to
 * satisfy the requirement.
 *
 * @param room The room whose messages to review.
 * @param handler Invoked once per message; the returned
 * {@link RoomMessageReview} is the verdict IVS Chat applies. `void` allows
 * the message unchanged.
 * @param props Optional `fallbackResult` applied when the handler errors or
 * times out.
 *
 * @example Deny messages containing a banned word
 * ```typescript
 * yield* IVSChat.onReviewMessage(
 *   room,
 *   (event) =>
 *     Effect.succeed(
 *       event.Content.includes("banned-word")
 *         ? { ReviewResult: "DENY", Attributes: { Reason: "moderated" } }
 *         : undefined,
 *     ),
 *   { fallbackResult: "ALLOW" },
 * );
 * ```
 */
export function onReviewMessage(room, handler, props) {
    return RoomMessageReviewEventSource.use((source) => source(room, handler, props));
}
//# sourceMappingURL=RoomMessageReviewEventSource.js.map