import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import * as Redacted from "effect/Redacted";
import { AlchemyContext } from "../../AlchemyContext.js";
import * as Output from "../../Output.js";
import { ProviderModePolicy } from "../../ProviderMode.js";
import { initialCwd } from "../../Util/Node.js";
import { staticConfigFromAssets, } from "../../Website/assets.js";
import { packSiteExtraFiles } from "../../Website/packExtraFiles.js";
import { Server as FrameworkServer, } from "../../Website/Server.js";
import { RecordSet } from "../RecordSet.js";
import { Server } from "../Server.js";
import { Service } from "../Service.js";
const resolveRef = (ref) => Effect.isEffect(ref) ? ref : Effect.succeed(ref);
/** Default listen port. Hetzner `deployUnit` curls `/health` whenever `PORT` is set. */
export const DEFAULT_WEBSITE_PORT = 3000;
export { staticConfigFromAssets };
export class FrameworkSiteError extends Data.TaggedError("Hetzner.Website.FrameworkSiteError") {
}
export const unwrapEnv = (env) => {
    if (env === undefined)
        return undefined;
    return Object.fromEntries(Object.entries(env).map(([key, value]) => [
        key,
        Redacted.isRedacted(value) ? Redacted.value(value) : value,
    ]));
};
export const resolveWebsiteServer = Effect.fn(function* (props) {
    if (props.server !== undefined) {
        return yield* resolveRef(props.server);
    }
    return yield* Server("Server", {
        serverType: "cpx12",
        image: "ubuntu-24.04",
        location: "fsn1",
        labels: props.tags,
    });
});
export const bindWebsiteDomain = Effect.fn(function* (props) {
    const zone = yield* resolveRef(props.zone);
    const name = Output.map((apex) => {
        const domain = props.domain;
        if (apex === undefined || domain === apex)
            return "@";
        const suffix = `.${apex}`;
        if (domain.endsWith(suffix))
            return domain.slice(0, -suffix.length);
        throw new Error(`Hetzner.Website domain "${domain}" is not inside zone "${apex}"`);
    })(zone.name);
    yield* RecordSet("Domain", {
        zone,
        name: name,
        type: "A",
        records: [{ value: props.server.ipv4 }],
        labels: props.tags,
    });
});
export const websiteUrl = (args) => args.domain !== undefined
    ? `http://${args.domain}:${String(args.port)}`
    : args.service.url;
/**
 * Shared implementation behind the Hetzner framework website composites:
 * build through the Node deploy target, then host one Service on a
 * Hetzner Server (auto-created `cpx12` in `fsn1` when `server` is omitted).
 *
 * During `alchemy dev` the site is the framework's own dev server and no
 * cloud resources are declared; `Alchemy.remote()` opts back into the
 * live Service path.
 */
const runFrameworkSite = Effect.fn("Hetzner.Website.FrameworkSite")(function* (id, props, config) {
    const ctx = yield* AlchemyContext;
    const remoted = yield* ProviderModePolicy;
    const isLocal = ctx.dev && remoted !== true;
    const path = yield* Path.Path;
    const fs = yield* FileSystem.FileSystem;
    const port = DEFAULT_WEBSITE_PORT;
    if (config.static?.spa && config.static.errorPage) {
        return yield* Effect.die(`Cannot provide both "spa" and "errorPage". A SPA answers misses with the index page (200); "errorPage" answers them with a real 404.`);
    }
    if (props.domain !== undefined && props.zone === undefined) {
        return yield* Effect.die(`Hetzner.Website "${config.name}": "domain" requires "zone" (an existing Hetzner.Zone).`);
    }
    const build = yield* FrameworkServer("Build", {
        framework: config.framework,
        target: config.target,
        root: props.rootDir,
        env: unwrapEnv(props.env),
        options: config.options,
        memo: props.memo,
        dev: props.dev,
    });
    if (isLocal) {
        return {
            url: build.url,
            server: undefined,
            service: undefined,
        };
    }
    // The build runs at APPLY time (`Website.Server` is a resource), so its
    // attributes are Outputs here — derive every deploy input lazily and let
    // the engine resolve them once the build has produced real paths. Reading
    // `build.distDir` eagerly in the composite body would observe an Output
    // proxy, not a string.
    const buildOut = Output.mapEffect(([serverEntry, distDir]) => Effect.gen(function* () {
        if (serverEntry === undefined || distDir === undefined) {
            return yield* Effect.die(new FrameworkSiteError({
                framework: config.framework,
                message: `The ${config.name} build produced no Node serve entry (serverModules[0]). The Node deploy target should write serve-node.mjs.`,
            }));
        }
        const main = path.resolve(initialCwd, serverEntry);
        if (!(yield* fs.exists(main).pipe(Effect.orElseSucceed(() => false)))) {
            return yield* Effect.die(new FrameworkSiteError({
                framework: config.framework,
                message: `The ${config.name} build produced no server entry at ${main}`,
            }));
        }
        return { distDir: path.resolve(initialCwd, distDir), main };
    }))(Output.all(build.serverEntry, build.distDir));
    const main = Output.map(buildOut, (out) => out.main);
    const server = yield* resolveWebsiteServer(props);
    const env = {
        ...unwrapEnv(props.env),
        PORT: String(port),
    };
    const extraFiles = Output.mapEffect((out) => packSiteExtraFiles(out.distDir, config.skipClientAssets === true ? "next" : "client").pipe(Effect.map((files) => files?.map((file) => ({
        source: file.source,
        destination: file.dest,
    })))))(buildOut);
    const service = yield* Service("Service", {
        server,
        main: main,
        extraFiles: extraFiles,
        port,
        env,
        isExternal: true,
        build: config.install !== undefined && config.install.length > 0
            ? { install: config.install }
            : undefined,
    });
    if (props.domain !== undefined && props.zone !== undefined) {
        yield* bindWebsiteDomain({
            domain: props.domain,
            zone: props.zone,
            server,
            tags: props.tags,
        });
    }
    return {
        url: websiteUrl({ domain: props.domain, service, port }),
        server,
        service,
    };
});
/**
 * Composite-level tagged errors (`FrameworkSiteError`, filesystem) are
 * defects — `Alchemy.Stack` only admits `ConfigError` on the user effect.
 */
export const makeFrameworkSite = (id, props, config) => runFrameworkSite(id, props, config).pipe(Effect.orDie);
//# sourceMappingURL=FrameworkSite.js.map