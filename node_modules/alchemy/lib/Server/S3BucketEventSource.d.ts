import * as Layer from "effect/Layer";
import * as S3 from "../AWS/S3/index.ts";
import * as SQS from "../AWS/SQS/index.ts";
/** @binding */
export declare const S3BucketEventSource: Layer.Layer<S3.BucketEventSource | SQS.QueueEventSource, never, import("../AWS/Environment.ts").AWSEnvironment | SQS.DeleteMessageBatch | SQS.ReceiveMessage | import("./Process.ts").ServerHost>;
//# sourceMappingURL=S3BucketEventSource.d.ts.map