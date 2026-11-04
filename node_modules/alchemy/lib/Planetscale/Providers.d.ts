import * as Layer from "effect/Layer";
import * as Provider from "../Provider.ts";
import * as Credentials from "./Credentials.ts";
declare const Providers_base: Provider.ProviderCollection<Providers, "Planetscale">;
/**
 * Service tag bundling all PlanetScale providers + auth + credentials. Use
 * `Planetscale.providers()` to materialize the full layer.
 */
export declare class Providers extends Providers_base {
}
export type ProviderRequirements = Layer.Services<ReturnType<typeof providers>>;
/**
 * Build the complete PlanetScale providers Layer. Provide this on a Stack
 * (or via `Effect.provide` at test time) to enable all PlanetScale
 * resources, the AuthProvider registration, and credential resolution.
 *
 * @example
 * ```ts
 * Effect.provide(Planetscale.providers())
 * ```
 */
export declare const providers: () => Layer.Layer<Credentials.Credentials | import("../Auth/Credentials.ts").CredentialsStore | import("effect/unstable/http/HttpClient").HttpClient | import("../Auth/Profile.ts").ProfileStore | Providers, never, import("../index.ts").AuthProviders | import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | import("effect/Crypto").Crypto | import("effect/FileSystem").FileSystem | import("effect/Path").Path | import("../Stack.ts").Stack | import("../Stage.ts").Stage>;
export {};
//# sourceMappingURL=Providers.d.ts.map