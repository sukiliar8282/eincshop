import * as Layer from "effect/Layer";
import * as Command from "../Command/index.ts";
import * as Provider from "../Provider.ts";
import * as Credentials from "./Credentials.ts";
declare const Providers_base: Provider.ProviderCollection<Providers, "Fly">;
export declare class Providers extends Providers_base {
}
export type ProviderRequirements = Layer.Services<ReturnType<typeof providers>>;
/**
 * Build a layer that registers Fly resource providers, the Fly
 * `AuthProvider`, the resolved `Credentials`, and an `HttpClient`. Include
 * this from your stack alongside other cloud `providers()` layers.
 *
 * Resource providers are inserted into {@link Provider.collection} as they
 * land. The collection starts empty so App / Machine / Service agents can
 * make a single minimal insertion.
 *
 * @example
 * ```typescript
 * import * as Alchemy from "alchemy";
 * import * as Fly from "alchemy/Fly";
 * import * as Effect from "effect/Effect";
 *
 * export default Alchemy.Stack(
 *   "MyStack",
 *   {
 *     providers: Fly.providers(),
 *     state: Alchemy.localState(),
 *   },
 *   Effect.gen(function* () {
 *     return {};
 *   }),
 * );
 * ```
 */
export declare const providers: () => Layer.Layer<import("./Checkpoint.ts").Checkpoint | import("./ConnectPostgres.ts").ConnectPostgres | Credentials.Credentials | import("../Auth/Credentials.ts").CredentialsStore | import("./Decrypt.ts").Decrypt | import("./DeleteObject.ts").DeleteObject | import("./Encrypt.ts").Encrypt | import("./Exec.ts").Exec | import("./Environment.ts").FlyEnvironment | import("./GetObject.ts").GetObject | import("./GetSecret.ts").GetSecret | import("./HeadObject.ts").HeadObject | import("effect/unstable/http/HttpClient").HttpClient | import("./ListObjectsV2.ts").ListObjectsV2 | import("./ListSecrets.ts").ListSecrets | import("./MountVolume.ts").MountVolume | import("../Auth/Profile.ts").ProfileStore | Provider.Provider<Command.Build> | Provider.Provider<Command.Dev> | Provider.Provider<Command.Exec> | Providers | import("./PutObject.ts").PutObject | import("./ReadRedis.ts").ReadRedis | import("./ReadWriteRedis.ts").ReadWriteRedis | import("./Sign.ts").Sign | import("./Verify.ts").Verify | import("./WriteRedis.ts").WriteRedis | import("./WriteSecret.ts").WriteSecret, never, import("../AlchemyContext.ts").AlchemyContext | import("../Artifacts.ts").ArtifactStore | import("../index.ts").AuthProviders | import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | import("effect/FileSystem").FileSystem | import("effect/Path").Path | import("../Stack.ts").Stack | import("../Stage.ts").Stage>;
export {};
//# sourceMappingURL=Providers.d.ts.map