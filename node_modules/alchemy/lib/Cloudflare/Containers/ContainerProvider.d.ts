import * as Containers from "@distilled.cloud/cloudflare/containers";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import { AlchemyContext } from "../../AlchemyContext.ts";
import { Docker } from "../../Docker/Docker.ts";
import * as Provider from "../../Provider.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { ContainerApplication } from "./ContainerApplication.ts";
export declare const LiveContainerProvider: () => import("effect/Layer").Layer<Provider.Provider<ContainerApplication<unknown>>, never, AlchemyContext | CloudflareEnvironment | Docker | FileSystem.FileSystem | Path.Path | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | Containers.CloudflareOpContext>;
export declare const retryForContainerApplicationReadiness: <A, E, R>(operation: string, applicationId: string, effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
//# sourceMappingURL=ContainerProvider.d.ts.map