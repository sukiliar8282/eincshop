import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as State from "../../State/index.ts";
import { type Target } from "../Session.ts";
/** Which store a state request addresses. */
export type StateSource = 
/** `.alchemy/` on this machine, ignoring whatever the project configures. */
{
    readonly backend: "local";
}
/** A provider's default state store, without loading a project entrypoint. */
 | ({
    readonly backend: "aws" | "cloudflare";
} & Pick<Target, "profile" | "envFile">)
/** Whatever the project's entrypoint configures. */
 | ({
    readonly backend: "configured";
} & Target);
/**
 * Resolve the state service a source addresses. The tree operations
 * (`State.listState`, `State.readState`, `State.deleteState`) take `State`
 * from context — provide the resolved service (or {@link layer}) to run
 * them against the chosen store:
 *
 * ```ts
 * const state = yield* Alchemist.State.store({ backend: "local" });
 * const items = yield* State.listState({ path }).pipe(
 *   Effect.provideService(State.State, Effect.succeed(state)),
 * );
 * ```
 */
export declare const store: (source: StateSource) => Effect.Effect<State.StateService, unknown, import("../../AlchemyContext.ts").AlchemyContext | import("../../Artifacts.ts").ArtifactStore | import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | import("../../Auth/Credentials.ts").CredentialsStore | import("effect/Crypto").Crypto | import("effect/FileSystem").FileSystem | import("effect/unstable/http/HttpClient").HttpClient | import("../../Interaction.ts").Interaction | import("effect/Path").Path | import("../../Auth/Profile.ts").ProfileStore | import("effect/Scope").Scope>;
/** The chosen store as a `State` layer. */
export declare const layer: (source: StateSource) => Layer.Layer<State.State, unknown, import("../../AlchemyContext.ts").AlchemyContext | import("../../Artifacts.ts").ArtifactStore | import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | import("../../Auth/Credentials.ts").CredentialsStore | import("effect/Crypto").Crypto | import("effect/FileSystem").FileSystem | import("effect/unstable/http/HttpClient").HttpClient | import("../../Interaction.ts").Interaction | import("effect/Path").Path | import("../../Auth/Profile.ts").ProfileStore>;
//# sourceMappingURL=state.d.ts.map