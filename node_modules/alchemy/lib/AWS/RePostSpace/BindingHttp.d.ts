import * as Effect from "effect/Effect";
import type { Space } from "./Space.ts";
/**
 * Shared scaffolding for the re:Post Private runtime bindings.
 *
 * NOT exported from `index.ts` — every `{Op}Http.ts` in this service is a
 * thin `Layer.effect(Cap, makeRePostSpaceHttpBinding({ … }))` over the
 * builder below. Everything except the operation and the IAM action list is
 * boilerplate: every re:Post Private data-plane operation is scoped to a
 * space, so the runtime callable injects the bound {@link Space}'s `spaceId`
 * and the deploy-time half grants `actions` on the space's ARN (re:Post
 * Private has a single `space` IAM resource type — channel- and
 * admin-scoped actions are all authorized against the space ARN).
 */
export declare const makeRePostSpaceHttpBinding: <I extends {
    spaceId: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.RePostSpace.SendInvites`. */
    tag: string;
    /** The distilled operation; `spaceId` is injected from the bound space. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the space ARN. */
    actions: readonly string[];
}) => Effect.Effect<(space: Space) => Effect.Effect<(request?: Omit<I, "spaceId"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map