import * as Effect from "effect/Effect";
/** Refuse to patch an App observed under a different immutable identity. */
export declare const ensureAppImmutableIdentity: (app: {
    id: string;
    projectId: string;
    region: {
        id: string;
    };
}, projectId: string, regionId: string) => Effect.Effect<void, never, never> | Effect.Effect<never, Error, never>;
//# sourceMappingURL=AppIdentity.d.ts.map