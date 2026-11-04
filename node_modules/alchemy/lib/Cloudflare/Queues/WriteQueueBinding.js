import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { makeQueueBinding, makeQueueHelpers } from "./QueueBinding.js";
import { WriteQueue } from "./WriteQueue.js";
/**
 * Implementation of the {@link WriteQueue} service that uses a native Worker
 * queue binding.
 */
export const WriteQueueBinding = Layer.effect(WriteQueue, Effect.suspend(() => makeQueueBinding({ makeClient: makeWriteQueueClient })));
/** Build the producer client over a native Worker queue binding. */
export const makeWriteQueueClient = ({ raw, use, }) => ({
    raw,
    send: (body, options) => use((q) => q.send(body, options)),
    sendBatch: (messages) => use((q) => q.sendBatch(messages.map((m) => ({
        body: m.body,
        ...(m.contentType ? { contentType: m.contentType } : {}),
    })))),
});
//# sourceMappingURL=WriteQueueBinding.js.map