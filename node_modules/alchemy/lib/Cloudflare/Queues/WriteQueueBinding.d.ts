import * as Layer from "effect/Layer";
import { makeQueueHelpers } from "./QueueBinding.ts";
import { WriteQueue, type WriteQueueClient } from "./WriteQueue.ts";
/**
 * Implementation of the {@link WriteQueue} service that uses a native Worker
 * queue binding.
 */
export declare const WriteQueueBinding: Layer.Layer<WriteQueue, never, import("../index.ts").WorkerEnvironment | import("../index.ts").Worker<any>>;
/** Build the producer client over a native Worker queue binding. */
export declare const makeWriteQueueClient: ({ raw, use, }: ReturnType<typeof makeQueueHelpers>) => WriteQueueClient;
//# sourceMappingURL=WriteQueueBinding.d.ts.map