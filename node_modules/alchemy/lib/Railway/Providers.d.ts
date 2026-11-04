import * as Layer from "effect/Layer";
import * as Command from "../Command/index.ts";
import * as Provider from "../Provider.ts";
import * as Credentials from "./Credentials.ts";
declare const Providers_base: Provider.ProviderCollection<Providers, "Railway">;
export declare class Providers extends Providers_base {
}
export type ProviderRequirements = Layer.Services<ReturnType<typeof providers>>;
/**
 * Build a layer that registers Railway resource providers, the Railway
 * `AuthProvider`, the resolved `Credentials`, and an `HttpClient`. Include
 * this from your stack alongside other cloud `providers()` layers.
 *
 * Resource providers are inserted into {@link Provider.collection} as they
 * land. The collection starts empty so Project / Service agents can make a
 * single minimal insertion.
 *
 * @example
 * ```typescript
 * import * as Alchemy from "alchemy";
 * import * as Railway from "alchemy/Railway";
 * import * as Effect from "effect/Effect";
 *
 * export default Alchemy.Stack(
 *   "MyStack",
 *   {
 *     providers: Railway.providers(),
 *     state: Alchemy.localState(),
 *   },
 *   Effect.gen(function* () {
 *     return {};
 *   }),
 * );
 * ```
 */
export declare const providers: () => Layer.Layer<import("./ConnectMongo.ts").ConnectMongo | import("./ConnectMySQL.ts").ConnectMySQL | import("./ConnectPostgres.ts").ConnectPostgres | Credentials.Credentials | import("../Auth/Credentials.ts").CredentialsStore | import("./DeleteObject.ts").DeleteObject | import("./Sandbox.ts").Exec | import("./GetObject.ts").GetObject | import("./HeadObject.ts").HeadObject | import("effect/unstable/http/HttpClient").HttpClient | import("./ListObjectsV2.ts").ListObjectsV2 | import("./MountVolume.ts").MountVolume | import("../Auth/Profile.ts").ProfileStore | Provider.Provider<Command.Build> | Provider.Provider<Command.Dev> | Provider.Provider<Command.Exec> | Providers | import("./PutObject.ts").PutObject | import("./Environment.ts").RailwayEnvironment | import("./ReadRedis.ts").ReadRedis | import("./ReadWriteRedis.ts").ReadWriteRedis | import("./WriteRedis.ts").WriteRedis, never, import("../AlchemyContext.ts").AlchemyContext | import("../Artifacts.ts").ArtifactStore | import("../index.ts").AuthProviders | import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | import("effect/FileSystem").FileSystem | import("effect/Path").Path | import("effect/Scope").Scope | import("../Stack.ts").Stack | import("../Stage.ts").Stage>;
export {};
//# sourceMappingURL=Providers.d.ts.map