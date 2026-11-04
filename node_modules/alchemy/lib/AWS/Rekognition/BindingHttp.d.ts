import * as Effect from "effect/Effect";
/**
 * Shared scaffolding for AWS Rekognition HTTP bindings.
 *
 * NOT exported from `index.ts` — every `{Op}Http.ts` in this service is a
 * thin `Layer.effect(Cap, makeRekognitionHttpBinding({ … }))` over the
 * builder below. Everything except the operation and the IAM action list is
 * boilerplate: Rekognition's image/video analysis and collection data-plane
 * IAM actions are granted on `*` because the resources they touch
 * (collections, users, jobs) are routinely created at runtime — e.g. a
 * collection per application tenant — so their identifiers are unknown at
 * deploy time.
 */
export declare const makeRekognitionHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Rekognition.DetectLabels`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map