import { Services } from "@distilled.cloud/hetzner";
import type { GetActionResponseAction } from "@distilled.cloud/hetzner/actions";
import * as Effect from "effect/Effect";
declare const ActionPending_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "ActionPending";
} & Readonly<A>;
export declare class ActionPending extends ActionPending_base<{
    actionId: number;
    status: string;
}> {
}
declare const ActionFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "ActionFailed";
} & Readonly<A>;
export declare class ActionFailed extends ActionFailed_base<{
    actionId: number;
    command: string;
    code?: string;
    message: string;
}> {
}
declare const ActionTimeout_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "ActionTimeout";
} & Readonly<A>;
export declare class ActionTimeout extends ActionTimeout_base<{
    actionId: number;
    status: string;
}> {
}
export type ActionRef = number | Pick<GetActionResponseAction, "id"> | GetActionResponseAction;
/**
 * Poll a Hetzner Action until it reaches `success` or `error`.
 *
 * Bounded: at most 24 polls, exponential backoff starting at 500ms and
 * capped at 5s. Already-finished actions return immediately.
 */
export declare const waitForAction: (ref: ActionRef) => Effect.Effect<GetActionResponseAction, ActionFailed | ActionTimeout | Services.actions.GetActionError, Services.actions.HetznerOpContext>;
/**
 * Wait for every Action in `refs` (in order). Empty input is a no-op.
 */
export declare const waitForActions: (refs: ReadonlyArray<ActionRef>) => Effect.Effect<GetActionResponseAction[], ActionFailed | ActionTimeout | Services.actions.GetActionError, Services.actions.HetznerOpContext>;
/**
 * Poll a Hetzner Cloud DNS Zone Action (`GET /zones/actions/{id}`) until it
 * reaches `success` or `error`. Zone actions live in a separate namespace
 * from compute `/actions/{id}` — do not use {@link waitForAction} for them.
 *
 * Bounded: at most 10 polls, exponential backoff starting at 500ms and
 * capped at 5s (under 60s total). Already-finished actions return
 * immediately.
 */
export declare const waitForZoneAction: (ref: ActionRef) => Effect.Effect<GetActionResponseAction, ActionFailed | ActionTimeout | Services.zoneActions.GetZonesActionError, Services.zoneActions.HetznerOpContext>;
export {};
//# sourceMappingURL=actions.d.ts.map