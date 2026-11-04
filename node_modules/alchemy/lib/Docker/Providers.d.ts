import * as Layer from "effect/Layer";
import * as Provider from "../Provider.ts";
declare const Providers_base: Provider.ProviderCollection<Providers, "Docker">;
export declare class Providers extends Providers_base {
}
export type ProviderRequirements = Layer.Services<ReturnType<typeof providers>>;
/**
 * Registers all Docker resource providers.
 *
 * Docker providers use the active Docker CLI context and are intentionally
 * separate from `Cloudflare.Container`.
 */
export declare const providers: () => Layer.Layer<import("./Docker.ts").Docker | Providers, never, any>;
export {};
//# sourceMappingURL=Providers.d.ts.map