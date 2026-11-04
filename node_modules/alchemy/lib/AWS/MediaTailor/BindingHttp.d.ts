import * as Effect from "effect/Effect";
import type { PlaybackConfiguration } from "./PlaybackConfiguration.ts";
/**
 * Shared HTTP scaffolding for the AWS Elemental MediaTailor runtime
 * bindings.
 *
 * NOT exported from `index.ts` — every thin `{Op}Http.ts` in this service is
 * a `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the two
 * builders below. Everything except the operation, the identifier resolver,
 * and the IAM action list is boilerplate.
 */
/**
 * Builder for account-level MediaTailor bindings (channel assembly control
 * and reads). Channel/program names are runtime request parameters, so the
 * deploy-time half grants `iamActions` on `Resource: ["*"]` and the runtime
 * callable passes the request through unchanged.
 */
export declare const makeMediaTailorHttpBinding: <I, A, E, R>(options: {
    /** Short capability name used in the binding sid and runtime span. */
    capability: string;
    /** IAM actions granted on `Resource: ["*"]`. */
    iamActions: readonly string[];
    /** The distilled operation implementing the capability. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
}) => Effect.Effect<() => Effect.Effect<(request: I) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Builder for bindings scoped to a {@link PlaybackConfiguration} (the
 * prefetch-schedule data plane). The runtime callable injects the bound
 * configuration's name as `PlaybackConfigurationName`, and the deploy-time
 * half grants `iamActions` on the configuration's ARN and the derived
 * `…:prefetchSchedule/{name}/*` ARN space.
 */
export declare const makeMediaTailorPlaybackHttpBinding: <I extends {
    PlaybackConfigurationName: string;
}, A, E, R>(options: {
    /** Short capability name used in the binding sid and runtime span. */
    capability: string;
    /** IAM actions granted on the configuration + prefetch-schedule ARNs. */
    iamActions: readonly string[];
    /**
     * The distilled operation; `PlaybackConfigurationName` is injected from
     * the bound configuration.
     */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
}) => Effect.Effect<(config: PlaybackConfiguration) => Effect.Effect<(request: Omit<I, "PlaybackConfigurationName">) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map