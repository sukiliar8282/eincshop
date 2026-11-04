import * as Layer from "effect/Layer";
import { CredentialsStore } from "../../Auth/Credentials.ts";
/**
 * Layer that registers the Cloudflare {@link AuthProvider} into the
 * {@link AuthProviders} registry when built. Include this in the Cloudflare
 * `providers()` layer so the alchemy CLI can discover it.
 */
export declare const CloudflareAuth: Layer.Layer<never, never, import("../../index.ts").AuthProviders | import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | CredentialsStore | import("effect/Crypto").Crypto | import("effect/FileSystem").FileSystem | import("effect/Path").Path>;
//# sourceMappingURL=AuthProvider.d.ts.map