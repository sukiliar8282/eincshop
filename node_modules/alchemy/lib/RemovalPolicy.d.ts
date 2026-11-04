import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
declare const RemovalPolicy_base: Context.ServiceClass<RemovalPolicy, "RemovalPolicy", "destroy" | "retain">;
/**
 * What the engine does with a resource's **physical** cloud object when the
 * resource is deleted — orphaned (its declaration was removed or renamed
 * away), destroyed (`alchemy destroy`), or superseded by a replacement's old
 * generation.
 *
 * - `"destroy"` (the default for most resource types) — call the provider's
 *   `delete`.
 * - `"retain"` — skip `provider.delete` entirely. The state row is still
 *   dropped: alchemy forgets the resource, the cloud object lives on.
 *
 * The policy is a *decoration* on the declaration, applied with
 * {@link retain} / {@link destroy}, and it is persisted on the resource's
 * state row. Because it isn't a prop, changing it produces no diff — the
 * resource plans as a `noop` and the deploy re-commits the row's policy in
 * place (see the noop branch of `Apply.ts`). So a policy change does take
 * effect from the very next deploy, even though the plan shows no changes.
 *
 * A few resource types default to `"retain"` because their contents are
 * irreplaceable (e.g. `GitHub.Repository`, `Cloudflare.Zone`); those opt into
 * deletion with `destroy()`.
 */
export declare class RemovalPolicy extends RemovalPolicy_base {
}
/**
 * Retain the physical cloud resource when the resource is deleted: the
 * provider's `delete` is never called, and the state row is dropped so
 * alchemy stops tracking it.
 *
 * Applies to every resource declared inside the piped effect, so it can
 * decorate a single resource or a whole scope.
 *
 * @example Retain one resource
 * ```typescript
 * const bucket = yield* R2.Bucket("Uploads").pipe(RemovalPolicy.retain());
 * ```
 *
 * @example Retain only in production
 * ```typescript
 * const stack = yield* Stack;
 * const bucket = yield* R2.Bucket("Uploads").pipe(
 *   RemovalPolicy.retain(stack.stage === "prod"),
 * );
 * ```
 *
 * @param enabled `true` (the default) retains; `false` selects `destroy`.
 *   May also be an `Effect` producing the boolean.
 */
export declare const retain: {
    (enabled?: boolean): <R, Req = never>(enabled: Effect.Effect<R, never, Req>) => Effect.Effect<R, never, Req>;
    <Req = never>(enabled: Effect.Effect<boolean, never, Req>): <R, Req2 = never>(a: Effect.Effect<R, never, Req2>) => Effect.Effect<R, never, Req | Req2>;
};
/**
 * Destroy the physical cloud resource when the resource is deleted — the
 * default for most resource types, and the way to opt out for the ones that
 * default to `retain` (e.g. `GitHub.Repository`, `Cloudflare.Zone`).
 *
 * @example Opt a retain-by-default resource into deletion
 * ```typescript
 * yield* GitHub.Repository("Preview", {
 *   owner: "my-org",
 *   name: "ephemeral-preview",
 * }).pipe(RemovalPolicy.destroy());
 * ```
 *
 * @param enabled `true` (the default) destroys; `false` selects `retain`.
 *   May also be an `Effect` producing the boolean.
 */
export declare const destroy: {
    (enabled?: boolean): <R, Req = never>(enabled: Effect.Effect<R, never, Req>) => Effect.Effect<R, never, Req>;
    <Req = never>(enabled: Effect.Effect<boolean, never, Req>): <R, Req2 = never>(a: Effect.Effect<R, never, Req2>) => Effect.Effect<R, never, Req | Req2>;
};
export {};
//# sourceMappingURL=RemovalPolicy.d.ts.map