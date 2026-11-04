import * as Effect from "effect/Effect";
import type { Room } from "./Room.ts";
/**
 * Shared scaffolding for Amazon IVS Chat HTTP bindings.
 *
 * NOT exported from `index.ts` — every thin `{Op}Http.ts` in this service is
 * a `Layer.effect(Cap, makeIvsChatRoomHttpBinding({ … }))` over the builder
 * below. Everything except the operation, the IAM action list, and an
 * optional request-shape mapper is boilerplate.
 */
/**
 * Build the impl Effect for an IVS Chat data-plane operation scoped to a
 * {@link Room}: the deploy-time half grants `actions` on the bound room's
 * ARN, and the runtime half injects the room's ARN as the `roomIdentifier`
 * of every request.
 *
 * `prepare` (optional) maps a friendlier public request shape onto the wire
 * request — e.g. `CreateChatToken` converts a `Duration.Input` into the wire
 * `sessionDurationInMinutes`. It defaults to identity.
 */
export declare const makeIvsChatRoomHttpBinding: <I extends {
    roomIdentifier: string;
}, A, E, R, Req = Omit<I, "roomIdentifier">>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.IVSChat.SendEvent`. */
    tag: string;
    /** The distilled operation. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the room ARN. */
    actions: readonly string[];
    /** Map the public request shape to the wire request (defaults to identity). */
    prepare?: (request: Req) => Omit<I, "roomIdentifier">;
}) => Effect.Effect<(room: Room) => Effect.Effect<(request: Req) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map