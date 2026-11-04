import * as Layer from "effect/Layer";
import { makeHelpers } from "./BucketBinding.ts";
import { ReadBucket, type ReadBucketClient } from "./ReadBucket.ts";
/**
 * Implementation of the {@link ReadBucket} binding that uses a Worker binding.
 */
export declare const ReadBucketBinding: Layer.Layer<ReadBucket, never, import("../index.ts").WorkerEnvironment | import("../index.ts").Worker<any>>;
/** Build the read half of the binding client. */
export declare const makeRead: ({ raw, use, wrapR2Object, wrapR2ObjectOrBody, }: ReturnType<typeof makeHelpers>) => ReadBucketClient;
//# sourceMappingURL=ReadBucketBinding.d.ts.map