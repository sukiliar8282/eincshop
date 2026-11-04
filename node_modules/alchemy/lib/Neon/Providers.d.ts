import * as Layer from "effect/Layer";
import * as Provider from "../Provider.ts";
import * as Credentials from "./Credentials.ts";
declare const Providers_base: Provider.ProviderCollection<Providers, "Neon">;
export declare class Providers extends Providers_base {
}
/**
 * Build a layer that registers all Neon resource providers, the Neon
 * `AuthProvider`, the resolved `Credentials`, and an `HttpClient`. Include
 * this from your stack alongside other cloud `providers()` layers.
 *
 * @example
 * ```typescript
 * import * as Alchemy from "alchemy";
 * import * as Cloudflare from "alchemy/Cloudflare";
 * import * as Neon from "alchemy/Neon";
 * import * as Effect from "effect/Effect";
 * import * as Layer from "effect/Layer";
 *
 * export default Alchemy.Stack(
 *   "MyStack",
 *   {
 *     providers: Layer.mergeAll(Cloudflare.providers(), Neon.providers()),
 *     state: Alchemy.localState(),
 *   },
 *   Effect.gen(function* () {
 *     const project = yield* Neon.Project("app-db");
 *     const branch = yield* Neon.Branch("app-branch", { project });
 *     return { branchId: branch.branchId };
 *   }),
 * );
 * ```
 */
export declare const providers: () => Layer.Layer<Credentials.Credentials | import("../Auth/Credentials.ts").CredentialsStore | import("effect/unstable/http/HttpClient").HttpClient | import("../Auth/Profile.ts").ProfileStore | Providers, never, import("../index.ts").AuthProviders | import("effect/FileSystem").FileSystem | import("effect/Path").Path | import("../Stack.ts").Stack | import("../Stage.ts").Stage>;
export {};
//# sourceMappingURL=Providers.d.ts.map