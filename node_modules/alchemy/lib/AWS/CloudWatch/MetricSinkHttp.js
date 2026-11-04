import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Binding from "../../Binding.js";
import { makeBatchedSink } from "../internal/BatchedSink.js";
import { isBindingHost } from "../Lambda/Function.js";
import { MetricSink, } from "./MetricSink.js";
import { PutMetricData } from "./PutMetricData.js";
const encoder = new TextEncoder();
/**
 * PutMetricData accepts up to 1 MB per POST; approximate each datum's wire
 * size by its JSON encoding and leave headroom for the request envelope
 * (`Action`, `Namespace`, form-encoding overhead).
 */
const MAX_BYTES = 1_000_000;
export const MetricSinkHttp = Layer.effect(MetricSink, Effect.gen(function* () {
    const putMetricData = yield* PutMetricData;
    return Effect.fn(function* (props) {
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            const host = yield* Binding.Host;
            if (isBindingHost(host)) {
                yield* host.bind `Allow(${host}, AWS.CloudWatch.MetricSink(${props.Namespace}))`({
                    policyStatements: [
                        {
                            Effect: "Allow",
                            // PutMetricData does not support resource-level permissions.
                            Action: ["cloudwatch:PutMetricData"],
                            Resource: ["*"],
                        },
                    ],
                });
            }
        }
        const put = yield* putMetricData();
        return makeBatchedSink({
            maxRecords: 1000,
            maxBytes: MAX_BYTES,
            sizeOf: (datum) => encoder.encode(JSON.stringify(datum)).length,
            send: (batch) => put({
                Namespace: props.Namespace,
                MetricData: [...batch],
            }),
            // PutMetricData is all-or-nothing — no per-datum partial failures to
            // extract, so there is no `unprocessed`/`rejected` handling here.
        });
    });
}));
//# sourceMappingURL=MetricSinkHttp.js.map