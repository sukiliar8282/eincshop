/**
 * Node-side path into the local workerd R2 simulator, built on the
 * runtime's platform proxy (`PlatformProxy.open` — our `getPlatformProxy`).
 *
 * For a `dev:` bucket there is no cloud bucket to speak REST to. Instead,
 * each operation opens a scoped platform proxy hosting the native R2
 * binding and runs against `proxy.env.R2` — the proxy protocol rehydrates
 * `R2Object`/`R2ObjectBody` on the Node side, matching the surface the
 * Worker-binding client builders (`makeRead` / `makeWrite`) consume, so the
 * `*Local` layers reuse those builders verbatim:
 *
 *   Node ── proxy.env.R2.get(...) ──▶ r2 service ──▶ R2BucketObject
 *
 * One proxy boot per operation — slow but correct; the `*Local` layers run
 * in deploy-time Actions, not on a request path. Data lands in the same
 * `{storage}/r2` directory every local worker binding reads.
 *
 * NOT exported from `index.ts` — capability-internal scaffolding.
 */
import { R2Bucket } from "@alchemy.run/cloudflare-runtime/core/bindings";
import { open } from "@alchemy.run/cloudflare-runtime/core/platform-proxy";
import * as Effect from "effect/Effect";
import { gatewayName, localGatewayRuntime } from "../LocalGateway.js";
import { makeR2ObjectWrappers } from "./BucketBinding.js";
import { R2Error } from "./BucketTypes.js";
const tryPromise = (fn) => Effect.tryPromise({
    try: fn,
    catch: (error) => new R2Error({
        message: error?.message ?? "Unknown error",
        cause: error,
    }),
});
/**
 * Binding-client helpers backed by a per-operation platform proxy instead
 * of a Worker's `env`. `raw` cannot be satisfied — a native bucket only
 * lives as long as its proxy's scope — so it dies with guidance.
 */
export const makeProxyBucketHelpers = (bucketName, 
/**
 * The FULL ambient stack-eval context: platform services for booting
 * workerd plus `CloudflareEnvironment`/`AlchemyContext` for the runtime
 * layer.
 */
ambient) => {
    const use = (fn) => Effect.scoped(Effect.gen(function* () {
        const proxy = yield* open({
            name: gatewayName("alchemy-r2-gateway", bucketName),
            bindings: [R2Bucket.local({ binding: "R2", id: bucketName })],
        });
        const bucket = proxy.env
            .R2;
        return yield* tryPromise(() => fn(bucket));
    })).pipe(Effect.provide(localGatewayRuntime), 
    // The gateway layer's platform requirements are satisfied by the
    // ambient stack-eval context; `Context<never>` can't prove that
    // statically, so erase the leftover R (and the proxy's own infra
    // error channel) with a cast — mirroring D1's gateway.
    Effect.provideContext(ambient));
    const raw = Effect.die(new R2Error({
        message: "A locally-emulated R2 bucket has no long-lived native binding outside a Worker; use put/get/head/list/delete (each runs through a scoped local gateway).",
        cause: new Error("unsupported"),
    }));
    return { raw, use, tryPromise, ...makeR2ObjectWrappers(tryPromise) };
};
//# sourceMappingURL=LocalR2Gateway.js.map