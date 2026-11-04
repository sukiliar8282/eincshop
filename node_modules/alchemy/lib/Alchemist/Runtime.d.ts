import * as Layer from "effect/Layer";
import { ArtifactStore } from "../Artifacts.ts";
import * as Interaction from "../Interaction.ts";
import { PlatformServices } from "../Util/PlatformServices.ts";
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
export declare const layer: () => Layer.Layer<import("../AlchemyContext.ts").AlchemyContext | ArtifactStore | import("../Auth/Credentials.ts").CredentialsStore | import("effect/unstable/http/HttpClient").HttpClient | Interaction.Interaction | import("../Auth/Profile.ts").ProfileStore | PlatformServices, import("effect/PlatformError").PlatformError, never>;
//# sourceMappingURL=Runtime.d.ts.map