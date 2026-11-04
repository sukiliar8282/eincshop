import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import * as Artifacts from "../../Artifacts.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { ContainerApplication } from "./ContainerApplication.ts";
/**
 * Local (dev) provider for Cloudflare Container applications.
 *
 * The Docker build/run is owned by `@alchemy.run/cloudflare-runtime/core`; this
 * provider's only job is to resolve the `dev` image the runtime should use —
 * a build context to `docker build` (Effect-native `main` or a user-supplied
 * Dockerfile) or a remote image to `docker pull` — mirroring the three image
 * variants of the live provider's `computeImage`.
 *
 * Everything else on the attributes is a placeholder: the real
 * `applicationId`/`configuration`/etc. only exist once the live provider
 * promotes this resource on a real deploy. The `applicationId` uses the local
 * id mechanism (`dev:<uuid>`) so the live provider can detect a dev resource
 * and create the real one.
 */
export declare const LocalContainerProvider: () => import("effect/Layer").Layer<import("../../Provider.ts").Provider<ContainerApplication<unknown>>, never, import("../../AlchemyContext.ts").AlchemyContext | Artifacts.ArtifactStore | CloudflareEnvironment | import("../../Docker/Docker.ts").Docker | FileSystem.FileSystem | Path.Path | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=LocalContainerProvider.d.ts.map