import { type RuntimeServices } from "@alchemy.run/cloudflare-runtime/core";
import * as WorkerProxy from "@alchemy.run/cloudflare-runtime/core/proxy/WorkerProxy";
import type * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import * as Scope from "effect/Scope";
import type * as ChildProcessSpawner from "effect/unstable/process/ChildProcessSpawner";
import { Stack } from "../../Stack.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import { LocalRuntimeState } from "../LocalRuntime.ts";
import { Worker } from "./Worker.ts";
export declare const LocalWorkerProvider: () => import("effect/Layer").Layer<import("../../Provider.ts").Provider<Worker<any>>, never, import("../../AlchemyContext.ts").AlchemyContext | import("../../Artifacts.ts").ArtifactStore | ChildProcessSpawner.ChildProcessSpawner | CloudflareEnvironment | FileSystem.FileSystem | LocalRuntimeState | Path.Path | Scope.Scope | Stack | WorkerProxy.WorkerProxy | RuntimeServices>;
//# sourceMappingURL=LocalWorkerProvider.d.ts.map