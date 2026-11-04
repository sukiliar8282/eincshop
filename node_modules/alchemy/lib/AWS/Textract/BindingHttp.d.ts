import * as Effect from "effect/Effect";
import type { Adapter } from "./Adapter.ts";
/**
 * Shared HTTP scaffolding for the Textract runtime bindings.
 *
 * NOT exported from `index.ts` — every `{Op}Http.ts` in this service is a
 * thin `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the two
 * builders below. Everything except the operation and the IAM action is
 * boilerplate.
 *
 * Textract's document analysis actions (sync `Analyze*`/`Detect*` and the
 * async `Start*`/`Get*` job APIs) have no resource-level IAM, so the
 * account-level builder grants on `*`. The adapter management actions
 * authorize on the adapter / adapter-version resource types, which use
 * Textract's nonstandard leading-slash ARN path
 * (`arn:aws:textract:{region}:{account}:/adapters/{adapterId}`), so the
 * adapter-scoped builder grants on the bound adapter's ARN and its
 * `/versions/*` children.
 */
export declare const makeTextractHttpBinding: <I extends object, A, E, R>(options: {
    /**
     * Short capability name used in the binding sid and runtime span, e.g.
     * `"AnalyzeDocument"`.
     */
    capability: string;
    /** IAM actions granted on `Resource: ["*"]`. */
    iamActions: readonly string[];
    /** The distilled operation implementing the capability. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an adapter-scoped Textract operation: the
 * binding is constructed with an {@link Adapter}, the deploy-time half
 * grants `iamActions` on the adapter's ARN (and its `/versions/*`
 * children), and the runtime callable injects the adapter's `AdapterId`
 * into every request.
 */
export declare const makeTextractAdapterHttpBinding: <I extends {
    AdapterId?: string;
}, A, E, R>(options: {
    /** Short capability name, e.g. `"GetAdapter"`. */
    capability: string;
    /** IAM actions granted on the adapter ARN + `/versions/*`. */
    iamActions: readonly string[];
    /** The distilled operation; `AdapterId` is injected from the adapter. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
}) => Effect.Effect<<Ad extends Adapter>(adapter: Ad) => Effect.Effect<(request?: Omit<I, "AdapterId"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map