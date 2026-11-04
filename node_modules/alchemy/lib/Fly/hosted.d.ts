import type { FlyMachineService } from "@distilled.cloud/fly-io/machines";
import * as machines from "@distilled.cloud/fly-io/machines";
import * as Effect from "effect/Effect";
import type * as rolldown from "rolldown";
import * as Bundle from "../Bundle/Bundle.ts";
import { type PackageInstall } from "../Bundle/InstalledPackages.ts";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import type { Docker } from "../Docker/Docker.ts";
import type { ResourceBinding } from "../Resource.ts";
import { createContainerRuntimeContext, type HostRuntimeContext } from "../Server/Process.ts";
import { extraFileDestination, type ExtraFile } from "../Util/extraFiles.ts";
import type { DiskSpec, ServiceBinding } from "./MountVolume.ts";
export type FlyHostRuntimeContext = HostRuntimeContext;
export declare const createFlyHostRuntimeContext: typeof createContainerRuntimeContext;
export declare const FLY_REGISTRY = "registry.fly.io";
export declare const DEFAULT_BASE_IMAGE = "node:26-slim";
export declare const DEFAULT_PORT = 3000;
export declare const MACHINE_PLATFORM = "linux/amd64";
export interface FlyBuildOptions extends Bundle.BundleConfig {
    /**
     * Native or Node-only packages to install into the Machine image with
     * `npm install` instead of bundling them. `pg` is CommonJS: Rolldown's
     * interop turns `Client` into a namespace (`The superclass is not a
     * constructor`). Same `build.install` shape as Lambda.
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
    image?: string;
    env?: Record<string, any>;
    isExternal?: boolean;
    build?: FlyBuildOptions;
    /**
     * Extra host directories baked into the image (framework client
     * assets, Next.js `.next`, …). Hashed into `code.hash` so asset
     * changes rebuild the image.
     */
    extraFiles?: ReadonlyArray<ExtraFile>;
}
export { extraFileDestination };
declare const DeployTokenMissing_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Fly.DeployTokenMissing";
} & Readonly<A>;
export declare class DeployTokenMissing extends DeployTokenMissing_base<{
    appName: string;
}> {
}
/** Flatten a binding/env leaf into a machine env string. Unwraps Redacted. */
export declare const plainEnvValue: (value: unknown) => string | undefined;
export declare const toEnvRecord: (env: Record<string, any> | undefined) => Record<string, string>;
export declare const collectBindingState: (bindings: readonly ResourceBinding<ServiceBinding>[]) => {
    env: Record<string, string>;
    mounts: DiskSpec[];
    redis: {
        name: string;
        id?: string;
    }[];
    buckets: {
        name: string;
        id?: string;
    }[];
    postgres: {
        clusterId: string;
        variableName?: string;
    }[];
};
export declare const defaultHttpServices: (port: number, count?: number) => FlyMachineService[];
export declare const createFlyHostedSupport: ({ stackName, stage, virtualEntryPlugin, docker, dotAlchemy, }: {
    stackName: string;
    stage: string;
    virtualEntryPlugin: (content: (importPath: string) => string) => rolldown.Plugin;
    docker: Docker["Service"];
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
        entryRel: string | undefined;
    }, Bundle.BundleError | import("effect/PlatformError").PlatformError, import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | FileSystem.FileSystem | Path.Path>;
    resolveImage: (input: {
        id: string;
        appName: string;
        props: HostedProgramProps;
        previousHash?: string;
        session?: {
            note: (message: string) => Effect.Effect<void>;
        };
    }) => Effect.Effect<{
        imageRef: string;
        codeHash: string;
    }, any, import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | FileSystem.FileSystem | Path.Path | import("../Stack.ts").Stack | import("../Stage.ts").Stage | machines.FlyIoOpContext>;
    hash: (props: HostedProgramProps) => Effect.Effect<string, Bundle.BundleError | import("effect/PlatformError").PlatformError, import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | FileSystem.FileSystem | Path.Path>;
};
/**
 * Bundle a Sprite program the same way {@link createFlyHostedSupport}
 * bundles a Service — rolldown + Node bootstrap — without building a
 * Docker image. The provider writes the files onto the Sprite.
 */
export declare const createSpriteHostedSupport: ({ stackName, stage, virtualEntryPlugin, }: {
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
    hash: (props: HostedProgramProps) => Effect.Effect<string, Bundle.BundleError | import("effect/PlatformError").PlatformError, FileSystem.FileSystem | Path.Path>;
};
//# sourceMappingURL=hosted.d.ts.map