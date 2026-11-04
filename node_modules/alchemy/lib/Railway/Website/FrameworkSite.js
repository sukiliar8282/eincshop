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
import { CustomDomain } from "../CustomDomain.js";
import { Project } from "../Project.js";
import { Service } from "../Service.js";
import { Cdn } from "./Cdn.js";
/** Port the generated Node serve entry and Railway Service listen on. */
export const WEBSITE_PORT = 3000;
export { staticConfigFromAssets };
export class FrameworkServerError extends Data.TaggedError("Railway.Website.FrameworkServerError") {
}
const envRecord = (env) => {
    if (env === undefined)
        return undefined;
    return Object.fromEntries(Object.entries(env).map(([key, value]) => [
        key,
        Redacted.isRedacted(value) ? Redacted.value(value) : value,
    ]));
};
/**
 * Shared implementation behind the Railway framework website composites:
 * build the framework through its Node deploy target, then deploy one
 * `Railway.Service` whose image bakes the Node serve entry plus
 * `clientDirectory`.
 *
 * During `alchemy dev` the site is the framework's own dev server (native
 * HMR) and no cloud resources are declared; `Alchemy.remote()` opts back
 * into the live Service path.
 *
 * Callers pipe `Namespace.push(id)` themselves (the composites do).
 */
const runFrameworkSite = Effect.fn("Railway.Website.FrameworkSite")(function* (_id, props, config) {
    const ctx = yield* AlchemyContext;
    const remoted = yield* ProviderModePolicy;
    const isLocal = ctx.dev && remoted !== true;
    const path = yield* Path.Path;
    const fs = yield* FileSystem.FileSystem;
    const root = path.resolve(initialCwd, props.rootDir ?? ".");
    const bake = config.bake ?? "client";
    const build = yield* FrameworkServer("Build", {
        framework: config.framework,
        target: config.target,
        root: props.rootDir,
        env: envRecord(props.env),
        options: config.options,
        memo: props.memo,
        dev: props.dev,
    });
    if (isLocal) {
        return {
            url: build.url,
            service: undefined,
            project: undefined,
        };
    }
    // The build runs at APPLY time (`Website.Server` is a resource), so its
    // attributes are Outputs here — derive every deploy input lazily and let
    // the engine resolve them once the build has produced real paths. Reading
    // `build.distDir` eagerly in the composite body would observe an Output
    // proxy, not a string.
    const buildOut = Output.mapEffect(([serverEntry, distDir]) => Effect.gen(function* () {
        if (serverEntry === undefined || distDir === undefined) {
            return yield* Effect.die(new FrameworkServerError({
                framework: config.framework,
                message: `The ${config.name} build produced no Node serve entry (serverModules[0]). The Node deploy target should write serve-node.mjs.`,
            }));
        }
        const main = path.resolve(initialCwd, serverEntry);
        if (!(yield* fs.exists(main).pipe(Effect.orElseSucceed(() => false)))) {
            return yield* Effect.die(new FrameworkServerError({
                framework: config.framework,
                message: `The ${config.name} build produced no server entry at ${main}`,
            }));
        }
        return { distDir: path.resolve(initialCwd, distDir), main };
    }))(Output.all(build.serverEntry, build.distDir));
    const main = Output.map(buildOut, (out) => out.main);
    // `bake === "next"` ships `.next`/`public`/`next.config.*` from the
    // project root; every other bake ships the build's dist directory. BOTH
    // must be derived from `buildOut`: the artifacts only exist once the
    // build has run at apply — probing the root here (pre-build) would miss
    // a fresh project's `.next` entirely.
    const extraFiles = Output.mapEffect((out) => packSiteExtraFiles(bake === "next" ? root : out.distDir, bake))(buildOut);
    const project = Effect.isEffect(props.project)
        ? yield* props.project
        : (props.project ?? (yield* Project("Project")));
    const environment = Effect.isEffect(props.environment)
        ? yield* props.environment
        : (props.environment ?? project);
    const service = yield* Service("Service", {
        project,
        environment,
        main: main,
        port: WEBSITE_PORT,
        healthcheck: "/health",
        isExternal: true,
        env: envRecord(props.env),
        extraFiles: extraFiles,
        build: config.install !== undefined ? { install: config.install } : undefined,
    });
    yield* Cdn("Cdn", {
        service,
        environment,
        htmlCaching: "AUTO",
        purgeOnDeploy: "HTML",
    });
    if (props.domain !== undefined && props.domain.length > 0) {
        yield* CustomDomain("Domain", {
            service,
            environment,
            domain: props.domain,
            targetPort: WEBSITE_PORT,
        });
        return {
            url: `https://${props.domain}`,
            service,
            project,
        };
    }
    return {
        url: service.url,
        service,
        project,
    };
});
/**
 * Composite-level tagged errors (`FrameworkServerError`, filesystem)
 * are defects — `Alchemy.Stack` only admits `ConfigError` on the user
 * effect.
 */
export const makeFrameworkSite = (id, props, config) => runFrameworkSite(id, props, config).pipe(Effect.orDie);
//# sourceMappingURL=FrameworkSite.js.map