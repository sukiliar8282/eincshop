/**
 * Shared scaffolding for Fly SecretKey HTTP bindings.
 *
 * NOT exported from `index.ts`.
 */
import type * as Effect from "effect/Effect";
import type { SecretAuth } from "./SecretHttp.ts";
import type { SecretKey } from "./SecretKey.ts";
export declare const bytesToBase64: (bytes: Uint8Array | ArrayLike<number>) => string;
export declare const base64ToBytes: (value: string | undefined) => Uint8Array;
export declare const makeHttpSecretKeyBinding: <Client>(options: {
    makeClient: (auth: SecretAuth, appName: Effect.Effect<string>, secretName: Effect.Effect<string>) => Client;
}) => Effect.Effect<(resource: SecretKey) => Effect.Effect<Client, never, never>, never, import("@distilled.cloud/fly-io").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=SecretKeyHttp.d.ts.map