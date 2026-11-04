import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import { AlchemyContext } from "../../AlchemyContext.js";
import * as Output from "../../Output.js";
import { ProviderModePolicy } from "../../ProviderMode.js";
import { Function as LambdaFunction, } from "../Lambda/Function.js";
import { asRouterDomain, registerDevRouterRoute } from "./DevRouterRoute.js";
import { Server } from "../../Website/Server.js";
import { makeKvSite } from "./StaticSite.js";
import { normalizeWebsiteDomain, } from "./shared.js";
/**
 * The shared implementation behind the framework website composites:
 * build the framework through its AWS deploy target, then deploy the
 * server output on a streaming Lambda Function URL with static assets in
 * S3 behind a CloudFront distribution (or attach to a shared Router).
 *
 * During `alchemy dev` the site is the framework's own dev server (native
 * HMR) and no cloud resources are declared; `Alchemy.remote()` opts back
 * into the full live deployment.
 *
 * Callers pipe `Namespace.push(id)` themselves (the composites do), so
 * resource FQNs are identical to the previous per-framework
 * implementations.
 */
export const makeFrameworkSite = Effect.fn("AWS.Website.FrameworkSite")(function* (id, propsIn, config) {
    // Props accept `Input<T>` throughout (matching the Cloudflare
    // composites); values flow into the resources below, which resolve
    // them at reconcile time. The plan-time reads in this function
    // (domain-shape branching, dev wiring, the build's rootDir/memo)
    // need concrete values — passing an `Output` for those specific
    // fields is unsupported, same as on the Cloudflare side.
    const props = propsIn;
    const ctx = yield* AlchemyContext;
    const remoted = yield* ProviderModePolicy;
    const isLocal = ctx.dev && remoted !== true;
    const routerDomain = asRouterDomain(normalizeWebsiteDomain(props.domain));
    // A Router-attached dev server is an ORIGIN for the emulated CloudFront
    // edge, which runs in a container and reaches the host through its
    // gateway address — it cannot open a connection to the host's loopback.
    // Frameworks bind loopback by default (Vite picks `[::1]`), so the edge
    // would get a refused connection and answer 502. Bind all interfaces
    // unless the caller asked for a specific host. Standalone dev sites, and
    // `mode: "external"` (we start nothing), keep the framework's default.
    const dev = isLocal && routerDomain && props.dev?.mode !== "external"
        ? { ...props.dev, host: props.dev?.host ?? "0.0.0.0" }
        : props.dev;
    const build = yield* Server("Build", {
        framework: config.framework,
        target: config.target,
        root: props.rootDir,
        env: props.env,
        options: config.options,
        memo: props.memo,
        dev,
    });
    if (isLocal) {
        // Router-attached sites register with the Router in dev exactly as they
        // do live — same resource types and ids — with the framework's dev
        // server standing in for the S3 + Lambda origins.
        const kvNamespace = routerDomain
            ? yield* registerDevRouterRoute(routerDomain, build.url)
            : undefined;
        return {
            bucket: undefined,
            build,
            files: undefined,
            distribution: undefined,
            invalidation: undefined,
            kvNamespace,
            server: undefined,
            serverUrl: undefined,
            url: build.url,
            urls: [build.url],
        };
    }
    const siteProps = {
        path: build.clientDir,
        assets: props.assets,
        domain: props.domain,
        cloudfrontUrl: props.cloudfrontUrl,
        edge: props.edge,
        bucketName: props.bucketName,
        forceDestroy: props.forceDestroy,
        invalidation: props.invalidation,
        tags: props.tags,
    };
    if (config.static) {
        const site = yield* makeKvSite(id, {
            ...siteProps,
            errorPage: config.static.errorPage,
            spa: config.static.spa,
        });
        return {
            ...site,
            build,
            server: undefined,
            serverUrl: undefined,
        };
    }
    const server = yield* LambdaFunction("Server", {
        main: build.serverEntry,
        handler: "handler",
        isExternal: true,
        // The AWS deploy target's finishing pass writes the server directory
        // as a complete Node deployment unit (entry + chunks) — ship it
        // as-is.
        bundle: false,
        runtime: props.runtime ?? "nodejs24.x",
        architecture: props.architecture,
        memorySize: props.memorySize ?? 1024,
        timeout: props.timeout ?? Duration.seconds(30),
        env: props.env,
        functionUrl: {
            authType: "NONE",
            invokeMode: "RESPONSE_STREAM",
        },
    });
    const serverHost = Output.map((url) => {
        if (!url) {
            throw new Error(`The ${config.name} server function did not produce a Function URL.`);
        }
        return new URL(url).hostname;
    })(server.functionUrl);
    const site = yield* makeKvSite(id, siteProps, { serverHost });
    return {
        ...site,
        build,
        server,
        serverUrl: server.functionUrl,
    };
});
//# sourceMappingURL=FrameworkSite.js.map