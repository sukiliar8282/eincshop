import type { Config } from "@distilled.cloud/hetzner";
import { Credentials } from "@distilled.cloud/hetzner";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
/**
 * Fully-resolved Hetzner Cloud environment for a stack.
 *
 * A Hetzner Cloud token is issued per project — the token IS the project
 * scope, so this service only carries `{ token, apiBaseUrl }`. Resolve
 * it inside lifecycle operations with `HetznerEnvironment.current`.
 */
export type HetznerEnvironmentShape = Config;
declare const HetznerEnvironment_base: Context.ServiceClass<HetznerEnvironment, "Hetzner::Environment", Effect.Effect<Config, never, never>>;
export declare class HetznerEnvironment extends HetznerEnvironment_base {
    static current: Effect.Effect<Config, never, HetznerEnvironment>;
    readonly kind: "Environment";
}
/**
 * Build a `HetznerEnvironment` layer from the distilled `Credentials`
 * service. Provide this after `Credentials.fromAuthProvider()`.
 */
export declare const fromCredentials: () => Layer.Layer<HetznerEnvironment, never, Credentials>;
export {};
//# sourceMappingURL=Environment.d.ts.map