import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Binding from "../../Binding.js";
import * as Output from "../../Output.js";
import { makeBatchedSink } from "../internal/BatchedSink.js";
import { isBindingHost } from "../Lambda/Function.js";
import { RecordsSink, } from "./RecordsSink.js";
import { WriteRecords } from "./WriteRecords.js";
const noRejections = { rejectedIndices: new Set() };
export const RecordsSinkHttp = Layer.effect(RecordsSink, Effect.gen(function* () {
    const writeRecords = yield* WriteRecords;
    return Effect.fn(function* (table, props) {
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            const host = yield* Binding.Host;
            if (isBindingHost(host)) {
                yield* host.bind `Allow(${host}, AWS.Timestream.RecordsSink(${table}))`({
                    policyStatements: [
                        {
                            Effect: "Allow",
                            Action: ["timestream:WriteRecords"],
                            Resource: [Output.interpolate `${table.tableArn}`],
                        },
                        // Timestream requires endpoint discovery; the ingest endpoint
                        // is resolved at runtime via DescribeEndpoints, which is not
                        // scoped to a resource.
                        {
                            Effect: "Allow",
                            Action: ["timestream:DescribeEndpoints"],
                            Resource: ["*"],
                        },
                    ],
                });
            }
        }
        const write = yield* writeRecords(table);
        const commonAttributes = props?.commonAttributes;
        return makeBatchedSink({
            maxRecords: 100,
            send: (batch) => write({
                Records: [...batch],
                ...(commonAttributes === undefined
                    ? {}
                    : { CommonAttributes: commonAttributes }),
            }).pipe(Effect.map(() => noRejections), 
            // Timestream ingests the valid subset and reports invalid records
            // positionally via RejectedRecordsException. Rejections are
            // permanent (schema conflicts, out-of-retention timestamps,
            // version conflicts) — drop them, never retry.
            Effect.catchTag("RejectedRecordsException", (error) => Effect.succeed({
                rejectedIndices: new Set((error.RejectedRecords ?? []).flatMap((rejected) => rejected.RecordIndex === undefined
                    ? []
                    : [rejected.RecordIndex])),
            }))),
            rejected: (out, batch) => out.rejectedIndices.size === 0
                ? []
                : batch.filter((_, index) => out.rejectedIndices.has(index)),
        });
    });
}));
//# sourceMappingURL=RecordsSinkHttp.js.map