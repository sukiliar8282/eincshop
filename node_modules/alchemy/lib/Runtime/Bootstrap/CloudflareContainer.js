/**
 * Process bootstrap core for `Cloudflare.Container` images. The runtime
 * (`bun` | `node`) is chosen at deploy time, and each is an optional peer,
 * so the platform-specific layers are supplied by the thin entry modules
 * {@link ./CloudflareContainerBun.ts} / {@link ./CloudflareContainerNode.ts}
 * rather than imported here. The generated entry imports one of those and
 * the user's `main`, nothing else — see {@link ./Process.ts} for why.
 */
import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Logger from "effect/Logger";
import { MinimumLogLevel } from "effect/References";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { CloudflareEnvironment } from "../../Cloudflare/CloudflareEnvironment.js";
import { reifyBoundConfigProvider } from "../../Runtime.js";
import { entrypointLayer, resolveProgram, runProcess, stackConstant, } from "./Process.js";
/** Serve the bundled container program on the runtime's HTTP server. */
export const bootstrapContainer = (runtime, entrypoint, options) => {
    const platform = Layer.mergeAll(runtime.services, FetchHttpClient.layer, 
    // TODO(sam): wire this up to telemetry more directly
    Logger.layer([Logger.consolePretty()]));
    const program = resolveProgram("default", { telemetry: true }).pipe(Effect.provide(entrypointLayer(entrypoint).pipe(Layer.provideMerge(stackConstant(options.stack.name, options.stack.stage)), Layer.provideMerge(runtime.httpServer), 
    // Capability bindings that talk to Cloudflare's HTTP API from inside
    // the container (e.g. R2/KV/Queue `*Http` bindings) resolve their
    // account via `CloudflareEnvironment` at runtime, exactly like the
    // Worker bridge does (the service value is an `Effect` of the
    // resolved credentials). The per-operation account/token are read
    // from the container's env (the bound token outputs), so an absent
    // account id here is harmless.
    Layer.provideMerge(Layer.succeed(CloudflareEnvironment, Effect.succeed({
        account: process.env.ALCHEMY_CLOUDFLARE_ACCOUNT_ID,
    }))), Layer.provideMerge(platform), Layer.provideMerge(Layer.succeed(ConfigProvider.ConfigProvider, 
    // Auto-bound `Config` values arrive in the env as
    // `{"_tag":"Redacted","value":...}` markers; reify them so a
    // `Config` re-read inside a handler decodes the raw source value.
    reifyBoundConfigProvider(ConfigProvider.fromEnv(), process.env))), Layer.provideMerge(Layer.succeed(MinimumLogLevel, process.env.DEBUG ? "Debug" : "Info")))), Effect.scoped);
    return runProcess("Container", program);
};
//# sourceMappingURL=CloudflareContainer.js.map