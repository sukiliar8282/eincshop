import { Credentials } from "@distilled.cloud/hetzner";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
export class HetznerEnvironment extends Context.Service()("Hetzner::Environment") {
    static current = HetznerEnvironment.use((env) => env);
    kind = "Environment";
}
/**
 * Build a `HetznerEnvironment` layer from the distilled `Credentials`
 * service. Provide this after `Credentials.fromAuthProvider()`.
 */
export const fromCredentials = () => Layer.effect(HetznerEnvironment, Effect.gen(function* () {
    return yield* Credentials;
}));
//# sourceMappingURL=Environment.js.map