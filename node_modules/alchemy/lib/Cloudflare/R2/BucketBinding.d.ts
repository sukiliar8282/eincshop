import type * as runtime from "@cloudflare/workers-types";
import * as Effect from "effect/Effect";
import { Worker, WorkerEnvironment } from "../Workers/Worker.ts";
import type { Bucket } from "./Bucket.ts";
import type { R2Object, ObjectBody } from "./BucketTypes.ts";
import { R2Error } from "./BucketTypes.ts";
/**
 * Shared scaffolding for the Worker-binding implementations of the R2 services.
 *
 * Resolves the {@link WorkerEnvironment} and host {@link Worker}, registers the
 * `r2_bucket` binding at deploy time, then delegates to `makeClient` with the
 * shared {@link Helpers} to build the read/write/read-write client.
 */
export declare const makeBucketBinding: <Client>(options: {
    makeClient: (helpers: ReturnType<typeof makeHelpers>) => Client;
}) => Effect.Effect<(bucket: Bucket) => Effect.Effect<Client, never, never>, never, WorkerEnvironment | Worker<any>>;
/**
 * Helpers shared by both the read and write halves of the binding client.
 *
 * Read-only (`wrapR2Objects`) and write-only (`wrapR2MultipartUpload`) wrappers
 * live in {@link makeRead}/{@link makeWrite} respectively — only the primitives
 * used by both sides are exposed here.
 */
export declare const makeHelpers: (env: Record<string, any>, bucket: Bucket) => {
    raw: Effect.Effect<runtime.R2Bucket, never, never>;
    use: <T>(fn: (raw: runtime.R2Bucket) => Promise<T>) => Effect.Effect<T, R2Error>;
    tryPromise: <T>(fn: () => Promise<T>) => Effect.Effect<T, R2Error>;
    wrapR2Object: (object: runtime.R2Object) => R2Object;
    wrapR2ObjectOrBody: (object: runtime.R2Object | runtime.R2ObjectBody | null) => R2Object | ObjectBody | null;
};
/**
 * The `R2Object`/`R2ObjectBody` → Effect-client wrappers, shared by the
 * Worker-binding helpers above and the local platform-proxy helpers
 * (`LocalR2Gateway.ts`), which differ only in how `raw`/`use` obtain the
 * native bucket.
 */
export declare const makeR2ObjectWrappers: (tryPromise: <T>(fn: () => Promise<T>) => Effect.Effect<T, R2Error>) => {
    wrapR2Object: (object: runtime.R2Object) => R2Object;
    wrapR2ObjectOrBody: (object: runtime.R2Object | runtime.R2ObjectBody | null) => R2Object | ObjectBody | null;
};
//# sourceMappingURL=BucketBinding.d.ts.map