import * as Layer from "effect/Layer";
import * as Command from "../Command/index.ts";
import * as Provider from "../Provider.ts";
import * as Credentials from "./Credentials.ts";
declare const Providers_base: Provider.ProviderCollection<Providers, "Hetzner">;
export declare class Providers extends Providers_base {
}
export type ProviderRequirements = Layer.Services<ReturnType<typeof providers>>;
/**
 * Build a layer that registers all Hetzner resource providers, the Hetzner
 * `AuthProvider`, the resolved `Credentials`, and an `HttpClient`. Include
 * this from your stack alongside other cloud `providers()` layers.
 *
 * Resource providers are inserted into {@link Provider.collection} as they
 * land.
 *
 * @example
 * ```typescript
 * import * as Alchemy from "alchemy";
 * import * as Hetzner from "alchemy/Hetzner";
 * import * as Effect from "effect/Effect";
 *
 * export default Alchemy.Stack(
 *   "MyStack",
 *   {
 *     providers: Hetzner.providers(),
 *     state: Alchemy.localState(),
 *   },
 *   Effect.gen(function* () {
 *     return {};
 *   }),
 * );
 * ```
 */
export declare const providers: () => Layer.Layer<Credentials.Credentials | import("../Auth/Credentials.ts").CredentialsStore | import("./Environment.ts").HetznerEnvironment | import("effect/unstable/http/HttpClient").HttpClient | import("./MountVolume.ts").MountVolume | import("../Auth/Profile.ts").ProfileStore | Provider.Provider<Command.Build> | Provider.Provider<Command.Dev> | Provider.Provider<Command.Exec> | Providers | import("./ReadDns.ts").ReadDns | import("./ReadWriteDns.ts").ReadWriteDns | import("./Ssh.ts").Ssh | import("./WriteDns.ts").WriteDns, never, import("../AlchemyContext.ts").AlchemyContext | import("../Artifacts.ts").ArtifactStore | import("../index.ts").AuthProviders | import("../Stack.ts").Stack | import("../Stage.ts").Stage | import("./Ssh.ts").SshServices>;
export {};
//# sourceMappingURL=Providers.d.ts.map