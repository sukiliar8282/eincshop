import { makeBindingLayer } from "./BindingLayer.js";
import { SecretKey, } from "./SecretKey.js";
/**
 * The layer that provides the Effect-native interface for the Cloudflare
 * Workers Secret Key binding.
 *
 * Provide it on the Worker effect (`Effect.provide(Cloudflare.Workers.SecretKeyBinding)`)
 * so that yielding a {@link SecretKey} binding attaches the native
 * `secret_key` binding to the surrounding Worker at deploy time and, at
 * runtime, resolves to a deferred {@link SecretKeyAccessor} (yield it to
 * obtain the native `CryptoKey`).
 */
export const SecretKeyBinding = makeBindingLayer(SecretKey, (raw) => raw);
//# sourceMappingURL=SecretKeyBinding.js.map