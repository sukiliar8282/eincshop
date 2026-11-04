import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Namespace from "../../Namespace.js";
import { AWSEnvironment } from "../Environment.js";
import { RoomMessageReviewEventSource as IVSChatRoomMessageReviewEventSource, } from "../IVSChat/RoomMessageReviewEventSource.js";
import * as Lambda from "./Function.js";
import { Permission as LambdaPermission } from "./Permission.js";
/**
 * An IVS Chat message review invocation — the PascalCase
 * `Content`/`MessageId`/`RoomArn` envelope IVS Chat sends the handler for
 * every `SendMessage` request.
 */
export const isRoomMessageEvent = (event) => typeof event?.Content === "string" &&
    typeof event?.MessageId === "string" &&
    typeof event?.RoomArn === "string";
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
export const RoomMessageReviewEventSource = Layer.effect(IVSChatRoomMessageReviewEventSource, Effect.gen(function* () {
    // this layer can only be used in a Lambda Function
    const host = yield* Lambda.Function;
    const Permission = yield* LambdaPermission;
    return Effect.fn(function* (room, handler, props) {
        const RoomArn = yield* room.roomArn;
        // Deploy-time: inject this function's ARN into the room's
        // messageReviewHandler (the room's provider syncs it) and create the
        // invoke Permission for ivschat. Skipped once running inside the
        // deployed Function (the global guard), where the only work is
        // registering the runtime dispatcher below. Namespaced under the
        // host for stable logical identity.
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            yield* Namespace.push(host.LogicalId, Effect.gen(function* () {
                // IVS Chat VALIDATES the invoke permission when the handler is
                // associated (CreateRoom/UpdateRoom fails with "invalid lambda
                // permission" otherwise), so the Permission must exist BEFORE
                // the room and cannot reference the room's ARN (that would be
                // circular). Scope it to this account's rooms instead — the
                // pattern the IVS Chat resource-policy docs recommend.
                const { accountId, region } = yield* AWSEnvironment.current;
                const permission = yield* Permission(`${room.LogicalId}-MessageReview-Permission`, {
                    action: "lambda:InvokeFunction",
                    functionName: host.functionArn,
                    principal: "ivschat.amazonaws.com",
                    sourceAccount: accountId,
                    sourceArn: `arn:aws:ivschat:${region}:${accountId}:room/*`,
                });
                // The Permission echoes the `functionName` prop (the function
                // ARN) as an attribute — threading it as the handler `uri`
                // makes the room reconcile only AFTER the invoke permission
                // exists.
                yield* room.bind `AWS.IVSChat.RoomMessageReview(${host}, ${room})`({
                    messageReviewHandler: {
                        uri: permission.functionName,
                        fallbackResult: props?.fallbackResult,
                    },
                });
            }));
        }
        yield* host.listen(Effect.gen(function* () {
            const roomArn = yield* RoomArn;
            return (event) => {
                if (isRoomMessageEvent(event) && event.RoomArn === roomArn) {
                    // Message review is request-response: the Lambda's return
                    // value IS the verdict IVS Chat applies. `void` from the
                    // handler allows the message unchanged.
                    return handler(event).pipe(Effect.map((result) => result ?? {
                        ReviewResult: "ALLOW",
                        Content: event.Content,
                        Attributes: event.Attributes,
                    }), Effect.orDie);
                }
            };
        }));
    });
}));
//# sourceMappingURL=RoomMessageReviewEventSource.js.map