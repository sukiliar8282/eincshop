/** @effect-diagnostics anyUnknownInErrorContext:off */
/**
 * The Lambda Function code-bundling machinery, extracted from the live
 * provider closure so it is reusable outside `FunctionProvider` — the floci
 * local provider's watch loop rebuilds the exact same artifact on file
 * change (see [FlociFunctionProvider](./FlociFunctionProvider.ts)).
 *
 * `makeFunctionBundler` resolves the platform services once and returns the
 * same `bundleCode(id, props)` the live provider always used, plus the
 * split-out pieces (`resolveBundlePlan` / `finishBundle` / `prebuiltCode`)
 * that let a watcher run `Bundle.watch` with the identical rolldown config
 * and post-process each incremental output into a deployable archive.
 */
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Bundle from "../../Bundle/Bundle.js";
import { hashPackageInstallIdentity, installResolvedPackages, matchesPackageRoot, normalizeInstallTargets, resolvePackageInstallIdentity, } from "../../Bundle/InstalledPackages.js";
import * as TempRoot from "../../Bundle/TempRoot.js";
import { sha256, sha256Object } from "../../Util/sha256.js";
import { zipCode, zipFiles } from "../../Util/zip.js";
/**
 * Evaluates a user-supplied Rolldown `external` option (string, RegExp, array,
 * or predicate) for a single module id, preserving its original semantics.
 */
export const matchesConfiguredExternal = (external, moduleId, parentId, isResolved) => {
    if (external === undefined)
        return false;
    if (typeof external === "function") {
        return external(moduleId, parentId, isResolved) === true;
    }
    const matchers = Array.isArray(external) ? external : [external];
    return matchers.some((matcher) => typeof matcher === "string" ? matcher === moduleId : matcher.test(moduleId));
};
export const makeFunctionBundler = Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const virtualEntryPlugin = yield* Bundle.virtualEntryPlugin;
    // Recursively list every file under `root` as sorted POSIX-relative
    // paths (prebuilt-directory packaging).
    const walkFiles = (root) => Effect.gen(function* () {
        const out = [];
        const go = Effect.fn(function* (rel) {
            const absolute = rel === "" ? root : `${root}/${rel}`;
            const entries = yield* fs.readDirectory(absolute);
            for (const entry of entries) {
                const childRel = rel === "" ? entry : `${rel}/${entry}`;
                const info = yield* fs.stat(`${root}/${childRel}`);
                if (info.type === "Directory") {
                    yield* go(childRel);
                }
                else {
                    out.push(childRel);
                }
            }
        });
        yield* go("");
        return out.sort();
    });
    // `bundle: false` — ship `main`'s directory as-is. Framework outputs
    // like nitro's `.output/server` are complete deployment units (entry +
    // chunks + their own `node_modules`); re-bundling them can orphan
    // CJS `require`s of exports-mapped subpaths.
    const prebuiltCode = Effect.fn(function* (realMain) {
        const lastSlash = realMain.lastIndexOf("/");
        const dir = realMain.slice(0, lastSlash);
        const files = yield* walkFiles(dir);
        const archiveFiles = [];
        const fileHashes = {};
        for (const rel of files) {
            const content = yield* fs.readFile(`${dir}/${rel}`);
            archiveFiles.push({ path: rel, content });
            fileHashes[rel] = yield* sha256(content);
        }
        const identityHash = yield* sha256Object(fileHashes);
        const buildArchive = Effect.gen(function* () {
            const archive = yield* zipFiles(archiveFiles);
            return { archive, archiveHash: identityHash };
        });
        return { identityHash, buildArchive };
    });
    const resolveBundlePlan = Effect.fn(function* (props) {
        const { output: buildOutput, install, pure: _pure, bundleAnalyzer: _bundleAnalyzer, ...inputOptions } = props.build ?? {};
        const sourcemap = buildOutput?.sourcemap ?? true;
        const uploadSourceMap = props.uploadSourceMap ?? true;
        const realMain = yield* TempRoot.resolveMainPath(props.main);
        const cwd = yield* TempRoot.findCwdForBundle(realMain);
        const rolldownSourcemap = sourcemap;
        const architecture = props.architecture ?? "x86_64";
        // Explicit install roots are excluded from the bundle and installed
        // into the deployment artifact. build.external stays a pure Rolldown
        // escape hatch and is not installed by Alchemy.
        const requested = yield* normalizeInstallTargets(install);
        const installRoots = new Set(Object.keys(requested));
        const configuredExternal = inputOptions.external;
        const externalOption = (moduleId, parentId, isResolved) => {
            if (moduleId.startsWith("@aws-sdk/"))
                return true;
            for (const root of installRoots) {
                if (matchesPackageRoot(moduleId, root))
                    return true;
            }
            return matchesConfiguredExternal(configuredExternal, moduleId, parentId, isResolved);
        };
        const entryPlugin = props.isExternal
            ? undefined
            : virtualEntryPlugin((importPath) => `
import { bootstrap } from "alchemy/Runtime/Bootstrap/Lambda";
import entrypoint from ${JSON.stringify(importPath)};

export default await bootstrap(entrypoint);
`);
        return {
            inputOptions: {
                ...inputOptions,
                input: realMain,
                cwd,
                external: externalOption,
                platform: "node",
                // The zip runtime is Node (`nodejs22.x` | `nodejs24.x`): resolve with
                // the node conditions and let rolldown supply the import kind. A
                // `bun` condition here would hand a Node function any package's
                // bun-specific entry. (Container-image functions are built by the
                // user's Dockerfile and never pass through this bundler.)
                resolve: {
                    ...inputOptions.resolve,
                    conditionNames: [
                        ...(inputOptions.resolve?.conditionNames ??
                            Bundle.NODE_CONDITION_NAMES),
                    ],
                },
                plugins: [inputOptions.plugins, entryPlugin],
            },
            outputOptions: {
                ...buildOutput,
                format: "esm",
                sourcemap: rolldownSourcemap,
                minify: buildOutput?.minify ?? false,
                entryFileNames: "index.js",
                codeSplitting: buildOutput?.codeSplitting ?? false,
            },
            extra: props.build,
            cwd,
            requested,
            sourcemap: rolldownSourcemap,
            uploadSourceMap,
            architecture,
        };
    });
    const finishBundle = Effect.fn(function* (plan, bundleOutput) {
        const mainFile = bundleOutput.files[0];
        const code = typeof mainFile.content === "string"
            ? new TextEncoder().encode(mainFile.content)
            : mainFile.content;
        const includeSourceMaps = plan.uploadSourceMap &&
            (plan.sourcemap === true || plan.sourcemap === "hidden");
        const extraFiles = bundleOutput.files
            .slice(1)
            .filter((f) => includeSourceMaps || !f.path.endsWith(".map"))
            .map((f) => ({
            path: f.path,
            content: f.content,
        }));
        // Resolve install versions without running npm so `diff` can compare a
        // stable identity hash. The archive build performs the install.
        const installIdentity = yield* resolvePackageInstallIdentity({
            cwd: plan.cwd,
            requested: plan.requested,
        });
        const resolved = installIdentity.resolved;
        const hasInstalledPackages = Object.keys(resolved).length > 0;
        // Identity hash drives change detection in `diff`. With native packages,
        // the installed bytes are not captured by the bundle hash, so fold the
        // resolved versions, package-manager lockfile, and architecture in
        // instead of installing.
        const identityHash = hasInstalledPackages
            ? yield* hashPackageInstallIdentity({
                bundleHash: bundleOutput.hash,
                identity: installIdentity,
                architecture: plan.architecture,
            })
            : bundleOutput.hash;
        const buildArchive = Effect.gen(function* () {
            const installedPackageFiles = hasInstalledPackages
                ? yield* installResolvedPackages({
                    resolved,
                    overrides: installIdentity.overrides,
                    architecture: plan.architecture,
                })
                : [];
            const archiveFiles = [...extraFiles, ...installedPackageFiles];
            const archive = yield* zipCode(code, archiveFiles.length > 0 ? archiveFiles : undefined);
            // The S3 asset key is content-addressed, so the archive hash must be a
            // true hash of the bytes when native packages are present.
            const archiveHash = installedPackageFiles.length > 0
                ? yield* sha256(archive)
                : bundleOutput.hash;
            return { archive, archiveHash };
        });
        return { identityHash, buildArchive };
    });
    const bundleCode = Effect.fn(function* (_id, props) {
        if (props.bundle === false) {
            const realMain = yield* TempRoot.resolveMainPath(props.main);
            return yield* prebuiltCode(realMain);
        }
        const plan = yield* resolveBundlePlan(props);
        const bundleOutput = yield* Bundle.build(plan.inputOptions, plan.outputOptions, plan.extra);
        return yield* finishBundle(plan, bundleOutput);
    });
    return { bundleCode, prebuiltCode, resolveBundlePlan, finishBundle };
});
//# sourceMappingURL=FunctionBundle.js.map