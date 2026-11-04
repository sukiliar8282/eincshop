import * as Layer from "effect/Layer";
import { makeHelpers } from "./BucketBinding.ts";
import { WriteBucket, type WriteBucketClient } from "./WriteBucket.ts";
/**
 * Implementation of the {@link WriteBucket} binding that uses a Worker binding.
 */
export declare const WriteBucketBinding: Layer.Layer<WriteBucket, never, import("../index.ts").WorkerEnvironment | import("../index.ts").Worker<any>>;
/** Build the write half of the binding client. */
export declare const makeWrite: ({ raw, use, tryPromise, wrapR2Object, wrapR2ObjectOrBody, }: ReturnType<typeof makeHelpers>) => WriteBucketClient;
//# sourceMappingURL=WriteBucketBinding.d.ts.map