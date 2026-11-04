/** @effect-diagnostics anyUnknownInErrorContext:off */
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import type { ProviderService } from "../../Provider.ts";
import type { ResourceLike } from "../../Resource.ts";
/**
 * Wraps a {@link ProviderService} so that EVERY lifecycle method
 * (`reconcile`, `diff`, `read`, `delete`, `list`, `precreate`, `tail`,
 * `logs`, ...) runs with the given services provided. The services are
 * provided *closest* to the lifecycle effect, so they override anything the
 * engine's ambient context supplies (credentials, region, endpoint,
 * environment).
 *
 * Method identity/shape is preserved exactly — the Provider interface is
 * structural, and the Proxy forwards non-function members (`version`,
 * `stables`, `aliases`, `nuke`, ...) untouched. Modeled on the lifecycle
 * Proxy in [Local/RpcProvider.ts](../../Local/RpcProvider.ts).
 */
export declare const withProviderContext: <R extends ResourceLike>(provider: ProviderService<R>, services: Layer.Layer<any, never, never>) => ProviderService<R>;
/**
 * Capture the ambient AWS environment — the exact tag set a local data
 * plane overrides: {@link Endpoint}, {@link Region}, {@link Credentials},
 * {@link AWSEnvironment} — as a layer that reproduces it verbatim. An
 * absent Endpoint is pinned as `undefined` (the SDK default resolver), so
 * a later ambient override cannot leak in.
 */
export declare const captureAwsEnvironment: Effect.Effect<Layer.Layer<any, never, never>>;
/**
 * Pin every provider in a collection (and every mode variant it lazily
 * resolves) to the AWS environment captured at REGISTRATION, provided
 * closest around each lifecycle effect. Providers therefore always run
 * against the environment they were registered with, regardless of the
 * caller's ambient context — which in an `alchemy dev` run is the emulator
 * (see AWS/Providers.ts): composition-time lookups get the emulator for
 * free while live-mode and mode-agnostic providers keep hitting the real
 * cloud. Local variants still win — their own data-plane override is
 * provided closer.
 */
export declare const pinCollectionEnvironment: <A extends {
    readonly kind: "ProviderCollection";
    get(service: string): ProviderService<any> | undefined;
    readonly providers: Record<string, ProviderService>;
}>(collection: A, environment: Layer.Layer<any, never, never>) => A;
/**
 * Layer-level companion to {@link withProviderContext}: given a provider
 * layer (e.g. `S3.BucketProvider()`) and a layer of override services,
 * returns a layer that builds both and re-registers every provider service
 * with its lifecycle methods wrapped in the override context.
 *
 * Built with `Layer.fromBuildMemo` (like `ProviderLayer.dual`) so the
 * `services` layer is built through the ambient `MemoMap`: pass a
 * **module-memoized layer reference** and it is constructed exactly once per
 * stack build no matter how many providers are wrapped with it.
 *
 * The services are also provided to the provider layer's *build* (winning
 * over the ambient context), so providers that resolve environment services
 * at layer construction see the override too.
 */
export declare const provideProviderContext: <ROut, E, RIn>(providerLayer: Layer.Layer<ROut, E, RIn>, services: Layer.Layer<any, any, never>) => Layer.Layer<ROut, any, RIn>;
//# sourceMappingURL=ProviderContext.d.ts.map