import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import type * as rolldown from "rolldown";
import * as Bundle from "../Bundle/Bundle.ts";
import { type PackageInstall } from "../Bundle/InstalledPackages.ts";
import type { ResourceBinding } from "../Resource.ts";
import { createContainerRuntimeContext, type HostRuntimeContext } from "../Server/Process.ts";
import { type ExtraFile } from "../Util/extraFiles.ts";
import type { MountSpec, ServiceBinding } from "./MountVolume.ts";
export type RailwayHostRuntimeContext = HostRuntimeContext;
/**
 * Container host. RPC wrapping lives in `Service.ts` so canvas Functions
 * do not pay for `rpc-server.ts` in the 96KB start command. The generated
 * Service entry is a shim that imports `alchemy/Runtime/Bootstrap/Railway`
 * (Node HTTP) plus the user's `main` — see that module for why.
 */
export declare const createRailwayHostRuntimeContext: typeof createContainerRuntimeContext;
/**
 * Function runtime: register the fetch handler on `globalThis` instead of
 * booting an HTTP server. The canvas wrapper `Bun.serve`s first so a
 * failed Effect import cannot 502 before the process is bound.
 */
export declare const createRailwayFunctionRuntimeContext: (type: string) => (id: string) => HostRuntimeContext;
export declare const DEFAULT_BASE_IMAGE = "node:26-slim";
export declare const DEFAULT_PORT = 3000;
export interface RailwayBuildOptions extends Bundle.BundleConfig {
    /**
     * Native or Node-only packages to install into the image with
     * `npm install` instead of bundling them. `pg` is CommonJS: Rolldown's
     * interop turns `Client` into a namespace (`The superclass is not a
     * constructor`). Same `build.install` shape as Lambda / Fly.
     *
     * @example
     * ```typescript
     * build: { install: ["pg"] }
     * ```
     */
    readonly install?: PackageInstall;
}
export type { ExtraFile };
export interface HostedProgramProps {
    main: string;
    handler?: string;
    port?: number;
    /**
     * Dockerfile `FROM` for the Effect-native image. Ignored for the
     * public-image path (`props.image` without `main`).
     *
     * @default "node:26-slim"
     */
    image?: string;
    env?: Record<string, any>;
    isExternal?: boolean;
    build?: RailwayBuildOptions;
    /**
     * Extra files/directories copied into `/app` after the bundled entry.
     * Hashed into `code.hash` so asset-only changes rebuild the image.
     */
    extraFiles?: ReadonlyArray<ExtraFile>;
}
declare const ExtraFileMissing_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Railway.ExtraFileMissing";
} & Readonly<A>;
export declare class ExtraFileMissing extends ExtraFileMissing_base<{
    source: string;
    dest: string;
}> {
}
/** Flatten a binding/env leaf into an env string. Unwraps Redacted. */
export declare const plainEnvValue: (value: unknown) => string | undefined;
export declare const toEnvRecord: (env: Record<string, any> | undefined) => Record<string, string>;
export declare const collectBindingState: (bindings: readonly ResourceBinding<ServiceBinding>[]) => {
    env: Record<string, string>;
    mounts: MountSpec[];
};
declare const FunctionBundleNotSingleFile_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Railway.FunctionBundleNotSingleFile";
} & Readonly<A>;
export declare class FunctionBundleNotSingleFile extends FunctionBundleNotSingleFile_base<{
    files: readonly string[];
}> {
}
/**
 * Bundle an Effect-native Railway.Function into a single TypeScript/JS
 * file for the canvas function runtime. No Docker. No registry.
 */
export declare const createRailwayFunctionSupport: ({ stackName, stage, virtualEntryPlugin, }: {
    stackName: string;
    stage: string;
    virtualEntryPlugin: (content: (importPath: string) => string) => rolldown.Plugin;
}) => {
    alchemyEnv: {
        ALCHEMY_STACK_NAME: string;
        ALCHEMY_STAGE: string;
        ALCHEMY_PHASE: string;
        HOST: string;
    };
    bundleProgram: (props: HostedProgramProps) => Effect.Effect<{
        files: {
            path: string;
            content: Uint8Array<ArrayBufferLike>;
        }[];
        hash: string;
    }, Bundle.BundleError | import("effect/PlatformError").PlatformError, FileSystem.FileSystem | Path.Path>;
    bundleToSource: (props: HostedProgramProps) => Effect.Effect<{
        source: string;
        hash: string;
    }, Bundle.BundleError | FunctionBundleNotSingleFile | import("effect/PlatformError").PlatformError, FileSystem.FileSystem | Path.Path>;
    hash: (props: HostedProgramProps) => Effect.Effect<string, Bundle.BundleError | FunctionBundleNotSingleFile | import("effect/PlatformError").PlatformError, FileSystem.FileSystem | Path.Path>;
};
export declare const createRailwayHostedSupport: ({ stackName, stage, virtualEntryPlugin, dotAlchemy, }: {
    stackName: string;
    stage: string;
    virtualEntryPlugin: (content: (importPath: string) => string) => rolldown.Plugin;
    dotAlchemy: string;
}) => {
    alchemyEnv: {
        ALCHEMY_STACK_NAME: string;
        ALCHEMY_STAGE: string;
        ALCHEMY_PHASE: string;
        HOST: string;
    };
    bundleProgram: (props: HostedProgramProps) => Effect.Effect<{
        files: {
            path: string;
            content: Uint8Array<ArrayBufferLike>;
        }[];
        hash: string;
    }, Bundle.BundleError | import("effect/PlatformError").PlatformError, FileSystem.FileSystem | Path.Path>;
    computeCodeHash: (props: HostedProgramProps) => Effect.Effect<{
        bundled: {
            files: {
                path: string;
                content: Uint8Array<ArrayBufferLike>;
            }[];
            hash: string;
        };
        dockerfile: string;
        codeHash: string;
        packageJson: string | undefined;
    }, Bundle.BundleError | import("effect/PlatformError").PlatformError, import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | FileSystem.FileSystem | Path.Path>;
    writeContext: (input: {
        id: string;
        props: HostedProgramProps;
        hashed: {
            bundled: {
                files: ReadonlyArray<{
                    path: string;
                    content: string | Uint8Array;
                }>;
            };
            dockerfile: string;
            packageJson: string | undefined;
        };
    }) => Effect.Effect<string, any, FileSystem.FileSystem | Path.Path | import("../Stack.ts").Stack | import("../Stage.ts").Stage>;
    hash: (props: HostedProgramProps) => Effect.Effect<string, Bundle.BundleError | import("effect/PlatformError").PlatformError, import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | FileSystem.FileSystem | Path.Path>;
};
//# sourceMappingURL=hosted.d.ts.map