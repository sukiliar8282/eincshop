import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Binding from "../../Binding.js";
import * as Output from "../../Output.js";
import { makeBatchedSink } from "../internal/BatchedSink.js";
import { isBindingHost } from "../Lambda/Function.js";
import { LogEventSink } from "./LogEventSink.js";
import { PutLogEvents } from "./PutLogEvents.js";
const encoder = new TextEncoder();
/**
 * The `PutLogEvents` batch-size formula charges each event its UTF-8 message
 * size plus 26 bytes of overhead.
 */
const PER_EVENT_OVERHEAD = 26;
/**
 * Select the events `rejectedLogEventsInfo` marks as permanently rejected,
 * preserving input order. The API skips (never ingests) these while still
 * processing the remaining valid events, so they must be dropped — not
 * retried:
 *
 * - `tooOldLogEventEndIndex` / `expiredLogEventEndIndex` — everything up to
 *   and including that index is too old / past retention;
 * - `tooNewLogEventStartIndex` — everything from that index on is more than
 *   2 hours in the future.
 */
const selectRejected = (out, batch) => {
    const info = out.rejectedLogEventsInfo;
    if (info === undefined) {
        return [];
    }
    const rejectedHeadEnd = Math.max(info.tooOldLogEventEndIndex ?? -1, info.expiredLogEventEndIndex ?? -1);
    const tooNewStart = info.tooNewLogEventStartIndex ?? batch.length;
    return batch.filter((_, index) => index <= rejectedHeadEnd || index >= tooNewStart);
};
export const LogEventSinkHttp = Layer.effect(LogEventSink, Effect.gen(function* () {
    const putLogEvents = yield* PutLogEvents;
    return Effect.fn(function* (logGroup, props) {
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            const host = yield* Binding.Host;
            if (isBindingHost(host)) {
                yield* host.bind `Allow(${host}, AWS.Logs.LogEventSink(${logGroup}))`({
                    policyStatements: [
                        {
                            // PutLogEvents authorizes against the log-stream resource
                            // (`log-group:{name}:log-stream:{stream}`), covered by the
                            // `:*` wildcard on the group ARN.
                            Effect: "Allow",
                            Action: ["logs:PutLogEvents"],
                            Resource: [Output.interpolate `${logGroup.logGroupArn}:*`],
                        },
                    ],
                });
            }
        }
        const put = yield* putLogEvents(logGroup);
        return makeBatchedSink({
            maxRecords: 10_000,
            maxBytes: 1_048_576,
            sizeOf: (event) => encoder.encode(event.message).length + PER_EVENT_OVERHEAD,
            send: (batch) => put({
                logStreamName: props.logStreamName,
                logEvents: [...batch],
            }),
            // No `unprocessed` extractor: PutLogEvents has no transient per-event
            // failure mode — timestamp rejections are permanent, so drop + surface.
            rejected: selectRejected,
        });
    });
}));
//# sourceMappingURL=LogEventSinkHttp.js.map