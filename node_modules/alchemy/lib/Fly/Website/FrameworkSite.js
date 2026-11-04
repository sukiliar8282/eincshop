import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import * as Redacted from "effect/Redacted";
import { AlchemyContext } from "../../AlchemyContext.js";
import * as Namespace from "../../Namespace.js";
import * as Output from "../../Output.js";
import { ProviderModePolicy } from "../../ProviderMode.js";
import { initialCwd } from "../../Util/Node.js";
import { staticConfigFromAssets, } from "../../Website/assets.js";
import { packSiteExtraFiles } from "../../Website/packExtraFiles.js";
import { Server as FrameworkServer, } from "../../Website/Server.js";
import { App } from "../App.js";
import { Bucket } from "../Bucket.js";
import { Certificate } from "../Certificate.js";
import { IpAssignment } from "../IpAssignment.js";
import { Service } from "../Service.js";
import { AssetDeployment } from "./AssetDeployment.js";
export { staticConfigFromAssets };
export class FrameworkSiteError extends Data.TaggedError("FrameworkSiteError") {
}
const DEFAULT_PORT = 3000;
const resolveRef = (ref) => Effect.isEffect(ref) ? ref : Effect.succeed(ref);
const envRecord = (env) => {
    if (env === undefined)
        return undefined;
    return Object.fromEntries(Object.entries(env).map(([key, value]) => [
        key,
        Redacted.isRedacted(value) ? Redacted.value(value) : value,
    ]));
};
const runFrameworkSite = Effect.fn("Fly.Website.FrameworkSite")(function* (_id, props, config) {
    const ctx = yield* AlchemyContext;
    const remoted = yield* ProviderModePolicy;
    const isLocal = ctx.dev && remoted !== true;
    const path = yield* Path.Path;
    const fs = yield* FileSystem.FileSystem;
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
            app: undefined,
            service: undefined,
            ip: undefined,
            certificate: undefined,
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
    const extraFiles = Output.mapEffect((out) => packSiteExtraFiles(out.distDir, config.skipClientAssets === true ? "next" : "client"))(buildOut);
    const app = props.app !== undefined ? yield* resolveRef(props.app) : yield* App("App");
    const ip = yield* IpAssignment("Shared", {
        app,
        type: "shared_v4",
    });
    // SPA: hashed `/assets` at Tigris. HTML and unknown paths stay on
    // origin (NodeServe `notFoundHandling: "spa"`). Intercepting `/` with
    // Tigris hangs SPA fallbacks — Fly does not rewrite `/counter/42` to
    // `index.html`.
    let statics;
    if (config.static?.spa === true) {
        const clientDir = Output.map(build.clientDir, (dir) => {
            if (dir === undefined) {
                throw new FrameworkSiteError({
                    framework: config.framework,
                    message: `The ${config.name} build produced no client assets directory`,
                });
            }
            return path.resolve(initialCwd, dir);
        });
        const bucket = yield* Bucket("Assets", { public: true });
        yield* AssetDeployment("Files", {
            bucket,
            sourcePath: clientDir,
            purge: true,
        });
        statics = Output.mapEffect(([clientDir, bucketName]) => Effect.gen(function* () {
            const assetsDir = path.join(clientDir, "assets");
            const exists = yield* fs
                .exists(assetsDir)
                .pipe(Effect.orElseSucceed(() => false));
            return exists
                ? [
                    {
                        guestPath: "/assets",
                        urlPrefix: "/assets",
                        tigrisBucket: bucketName,
                    },
                ]
                : undefined;
        }))(Output.all(clientDir, bucket.name));
    }
    const service = yield* Service("Service", {
        app,
        main: main,
        port: DEFAULT_PORT,
        // Node + nitro SSR needs more than the Machine default 256MB.
        guest: { memoryMb: 512 },
        isExternal: true,
        env: props.env,
        extraFiles: extraFiles,
        statics: statics,
        build: config.install !== undefined && config.install.length > 0
            ? { install: config.install }
            : undefined,
    });
    const certificate = props.domain !== undefined
        ? yield* Certificate("Certificate", {
            app,
            hostname: props.domain,
            kind: "acme",
        })
        : undefined;
    const url = props.domain !== undefined ? `https://${props.domain}` : app.url;
    return { url, app, service, ip, certificate };
});
/**
 * Shared implementation behind the Fly framework website composites:
 * `Website.Server` runs the framework toolchain (dev sidecar / production
 * build), then a live deploy hosts `serve-node.mjs` on a Fly.Service.
 *
 * Callers pipe `Namespace.push(id)` themselves (the composites do).
 *
 * Composite-level tagged errors (`FrameworkSiteError`, filesystem) are
 * defects — `Alchemy.Stack` only admits `ConfigError` on the user
 * effect, same as Cloudflare/AWS Website composites.
 */
export const makeFrameworkSite = (id, props, config) => runFrameworkSite(id, props, config).pipe(Effect.orDie);
/** Push {@link id} then run {@link makeFrameworkSite}. */
export const frameworkSite = (id, props, config) => makeFrameworkSite(id, props, config).pipe(Namespace.push(id));
//# sourceMappingURL=FrameworkSite.js.map