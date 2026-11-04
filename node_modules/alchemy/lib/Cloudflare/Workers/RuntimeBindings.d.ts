import type { BindingHook, BindingServices } from "@alchemy.run/cloudflare-runtime/core";
import { AnalyticsEngine, Assets, Browser, D1, DispatchNamespace, Hyperdrive, Images, KvNamespace, Queue, R2Bucket, RateLimit, SecretsStore, SendEmail, Stream as StreamSim } from "@alchemy.run/cloudflare-runtime/core/bindings";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import type { WorkerBinding } from "./WorkerBinding.ts";
declare const WorkerValidationError_base: Schema.Class<WorkerValidationError, Schema.TaggedStruct<"WorkerValidationError", {
    readonly message: Schema.String;
    readonly hint: Schema.optional<Schema.String>;
    readonly value: Schema.Unknown;
}>, import("effect/Cause").YieldableError>;
export declare class WorkerValidationError extends WorkerValidationError_base {
}
export declare const toRuntimeBinding: (b: WorkerBinding, devRemote?: Record<string, boolean> | undefined) => Effect.Effect<BindingHook<AnalyticsEngine.AnalyticsEngine> | BindingHook<Assets.Assets> | BindingHook<D1.D1> | BindingHook<Hyperdrive.Hyperdrive> | BindingHook<KvNamespace.KvNamespace> | BindingHook<R2Bucket.R2Bucket> | BindingHook<RateLimit.RateLimit> | BindingHook<SecretsStore.SecretsStore> | BindingHook<Browser.Browser | import("@alchemy.run/cloudflare-runtime/core/globals/Loopback").Loopback> | BindingHook<DispatchNamespace.DispatchNamespace | import("@alchemy.run/cloudflare-runtime/core/remote-bindings/RemoteBindings").RemoteBindings> | BindingHook<Images.Images | import("@alchemy.run/cloudflare-runtime/core/globals/Loopback").Loopback> | BindingHook<import("@alchemy.run/cloudflare-runtime/core/globals/Loopback").Loopback | StreamSim.Stream> | BindingHook<Queue.Queue | import("@alchemy.run/cloudflare-runtime/core/registry/RegistryProxy").RegistryProxy> | BindingHook<import("@alchemy.run/cloudflare-runtime/core/remote-bindings/RemoteBindings").RemoteBindings | SendEmail.SendEmail>, WorkerValidationError, never>;
/**
 * Turns the serializable half of a local Worker configuration into the
 * cloudflare-runtime binding hooks consumed by `Runtime.start`.
 *
 * Kept in a leaf module, independent of the provider, so a Vite child
 * process can reconstruct the hooks after receiving plain binding
 * descriptors from its parent without evaluating the provider's module
 * graph. Binding hooks themselves are Effects and cannot cross a process
 * boundary.
 *
 * `config.env` must already be resolved to plain values — `Worker.URL`
 * sentinels substituted with the actual dev-proxy URL by the caller.
 */
export declare const materializeRuntimeBindings: (config: {
    name: string;
    env?: Record<string, unknown>;
    hasAssets: boolean;
    bindingDescriptors: WorkerBinding[];
    /** Binding name → opt-out of local emulation (`Alchemy.remote()`). */
    devRemote?: Record<string, boolean>;
    /**
     * Simulated Cloudflare Access config (`dev: { access: ... }`), lowered
     * into the `ALCHEMY_DEV_ACCESS` env binding the worker bridge reads to
     * serve `ctx.access` locally.
     */
    devAccess?: {
        aud?: string;
        identity?: Record<string, unknown>;
    };
}, options: {
    accountId: string;
    selfUrl: string | undefined;
    stack: {
        name: string;
        stage: string;
    };
}) => Effect.Effect<BindingHook<BindingServices>[], WorkerValidationError, never>;
export {};
//# sourceMappingURL=RuntimeBindings.d.ts.map