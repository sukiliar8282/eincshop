import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { CredentialsStoreLive } from "../Auth/Credentials.js";
import { ProfileStoreLive } from "../Auth/Profile.js";
import * as Provider from "../Provider.js";
import { NeonAuth } from "./AuthProvider.js";
import { Branch, BranchProvider } from "./Branch.js";
import * as Credentials from "./Credentials.js";
import { Project, ProjectProvider } from "./Project.js";
export class Providers extends Provider.ProviderCollection()("Neon") {
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
export const providers = () => Layer.effect(Providers, Provider.collection([Project, Branch])).pipe(Layer.provide(Layer.mergeAll(ProjectProvider(), BranchProvider())), Layer.provideMerge(Credentials.fromAuthProvider()), Layer.provideMerge(NeonAuth), Layer.provideMerge(ProfileStoreLive), Layer.provideMerge(CredentialsStoreLive), Layer.provideMerge(FetchHttpClient.layer), Layer.orDie);
//# sourceMappingURL=Providers.js.map