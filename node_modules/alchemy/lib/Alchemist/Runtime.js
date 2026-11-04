import * as ConfigProvider from "effect/ConfigProvider";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { AlchemyContextLive } from "../AlchemyContext.js";
import { ArtifactStore, createArtifactStore } from "../Artifacts.js";
import { CredentialsStoreLive } from "../Auth/Credentials.js";
import { ProfileStoreLive } from "../Auth/Profile.js";
import * as Interaction from "../Interaction.js";
import { PlatformServices } from "../Util/PlatformServices.js";
import { routeCacheLayer } from "./Session.js";
/**
 * All services required by the programmatic Alchemist API.
 *
 * Progress reporting remains caller-controlled: without an override the
 * default reporter is a no-op, while interactive and plain renderers can
 * provide {@link import("./Progress.ts").Progress} around individual calls.
 * The non-interactive Interaction default serves the engine paths that need
 * one (state-store confirms fail typed; profile probes never prompt).
 *
 * @example
 * ```ts
 * Effect.runPromise(
 *   program.pipe(Effect.provide(Alchemist.layer()), Effect.scoped),
 * )
 * ```
 */
export const layer = () => Layer.mergeAll(Layer.mergeAll(AlchemyContextLive, ProfileStoreLive, CredentialsStoreLive).pipe(Layer.provideMerge(PlatformServices)), FetchHttpClient.layer, ConfigProvider.layer(ConfigProvider.fromEnv()), Layer.succeed(ArtifactStore, createArtifactStore()), routeCacheLayer, Interaction.layerNonInteractive());
//# sourceMappingURL=Runtime.js.map