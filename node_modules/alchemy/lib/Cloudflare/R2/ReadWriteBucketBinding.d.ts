import * as Layer from "effect/Layer";
import { makeHelpers } from "./BucketBinding.ts";
import { ReadWriteBucket, type ReadWriteBucketClient } from "./ReadWriteBucket.ts";
/**
 * Implementation of the {@link ReadWriteBucket} binding that uses a Worker binding.
 */
export declare const ReadWriteBucketBinding: Layer.Layer<ReadWriteBucket, never, import("../index.ts").WorkerEnvironment | import("../index.ts").Worker<any>>;
/** Build the read-write binding client from its read and write halves. */
export declare const makeReadWrite: (helpers: ReturnType<typeof makeHelpers>) => ReadWriteBucketClient;
//# sourceMappingURL=ReadWriteBucketBinding.d.ts.map