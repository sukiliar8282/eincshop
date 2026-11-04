import * as Layer from "effect/Layer";
import * as Provider from "../Provider.ts";
import * as Credentials from "./Credentials.ts";
export { Credentials } from "@distilled.cloud/axiom/Credentials";
declare const Providers_base: Provider.ProviderCollection<Providers, "Axiom">;
export declare class Providers extends Providers_base {
}
export type ProviderRequirements = Layer.Services<ReturnType<typeof providers>>;
/**
 * Axiom providers and credentials. Wires up Dataset, ApiToken, Notifier,
 * Monitor, Dashboard, VirtualField, View and Annotation resources, and
 * registers the Axiom AuthProvider so `alchemy profile edit` can configure it.
 */
export declare const providers: () => Layer.Layer<Credentials.Credentials | import("../Auth/Credentials.ts").CredentialsStore | import("effect/unstable/http/HttpClient").HttpClient | import("../Auth/Profile.ts").ProfileStore | Providers, never, import("../index.ts").AuthProviders | import("effect/FileSystem").FileSystem | import("effect/Path").Path | import("../Stack.ts").Stack | import("../Stage.ts").Stage>;
//# sourceMappingURL=Providers.d.ts.map