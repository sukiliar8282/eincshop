import * as Effect from "effect/Effect";
import type * as HttpClient from "effect/unstable/http/HttpClient";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Credentials } from "../Credentials.ts";
import type { Bucket } from "./Bucket.ts";
import type { makeHelpers } from "./BucketBinding.ts";
import type { R2Auth } from "./BucketHttp.ts";
/**
 * Shared scaffolding for the R2 `*Local` binding layers.
 *
 * Resolves the account + captures the ambient current-credentials context at
 * layer construction, then returns the deferred binding callable. The
 * callable reads the bucket name/jurisdiction as deferred accessors
 * (resolved at apply time) and builds the client per resolved name:
 *
 * - a REAL name gets the HTTP client (same builders as the `*Http` variant,
 *   authorized with the current CLI credentials — no minted token);
 * - a `dev:` name (local emulation under `alchemy dev`) gets the native
 *   binding client (same builders as the `*Binding` variant) over a scoped
 *   platform-proxy gateway (see `LocalR2Gateway.ts`).
 *
 * NOT exported from `index.ts`.
 */
export declare const makeLocalBucketBinding: <Client extends object>(options: {
    makeHttpClient: (auth: R2Auth, bucketName: Effect.Effect<string>, jurisdiction: Effect.Effect<string>) => Client;
    makeNativeClient: (helpers: ReturnType<typeof makeHelpers>) => Client;
}) => Effect.Effect<(bucket: Bucket) => Effect.Effect<Client, never, never>, never, CloudflareEnvironment | Credentials | HttpClient.HttpClient>;
//# sourceMappingURL=BucketLocal.d.ts.map