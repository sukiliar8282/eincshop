import * as Effect from "effect/Effect";
/**
 * Shared HTTP scaffolding for the Polly runtime bindings.
 *
 * NOT exported from `index.ts` — every `{Op}Http.ts` in this service is a
 * thin `Layer.effect(Cap, makePollyHttpBinding({ … }))` over the builder
 * below. Everything except the operation and the IAM action is boilerplate.
 *
 * Per the `polly` service authorization reference, only the lexicon
 * management actions (`GetLexicon`, `PutLexicon`, `DeleteLexicon`) support
 * resource-level IAM (the `lexicon` resource type); the synthesis, task,
 * and describe actions authorize on `Resource: ["*"]`, so the account-level
 * builder grants on `*`.
 */
export declare const makePollyHttpBinding: <I extends object, A, E, R>(options: {
    /**
     * Short capability name used in the binding sid and runtime span, e.g.
     * `"SynthesizeSpeech"`.
     */
    capability: string;
    /** IAM actions granted on `Resource: ["*"]`. */
    iamActions: readonly string[];
    /** The distilled operation implementing the capability. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map