import * as Layer from "effect/Layer";
import { AWSEnvironment } from "../AWS/Environment.ts";
import * as SQS from "../AWS/SQS/index.ts";
import { ServerHost } from "./Process.ts";
export declare const SQSQueueEventSource: Layer.Layer<SQS.QueueEventSource, never, AWSEnvironment | SQS.DeleteMessageBatch | SQS.ReceiveMessage | ServerHost>;
//# sourceMappingURL=SQSQueueEventSource.d.ts.map