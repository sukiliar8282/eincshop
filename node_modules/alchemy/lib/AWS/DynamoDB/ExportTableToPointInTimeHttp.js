import * as DynamoDB from "@distilled.cloud/aws/dynamodb";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Binding from "../../Binding.js";
import * as Output from "../../Output.js";
import { isBindingHost } from "../Lambda/Function.js";
import { ExportTableToPointInTime, } from "./ExportTableToPointInTime.js";
export const ExportTableToPointInTimeHttp = Layer.effect(ExportTableToPointInTime, Effect.gen(function* () {
    const exportTableToPointInTime = yield* DynamoDB.exportTableToPointInTime;
    return Effect.fn(function* (table, bucket) {
        const TableArn = yield* table.tableArn;
        const S3Bucket = yield* bucket.bucketName;
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            const host = yield* Binding.Host;
            if (isBindingHost(host)) {
                yield* host.bind `Allow(${host}, AWS.DynamoDB.ExportTableToPointInTime(${table}, ${bucket}))`({
                    policyStatements: [
                        {
                            Effect: "Allow",
                            Action: ["dynamodb:ExportTableToPointInTime"],
                            Resource: [table.tableArn],
                        },
                        {
                            Effect: "Allow",
                            Action: [
                                "s3:AbortMultipartUpload",
                                "s3:PutObject",
                                "s3:PutObjectAcl",
                            ],
                            Resource: [Output.interpolate `${bucket.bucketArn}/*`],
                        },
                    ],
                });
            }
        }
        return Effect.fn(`AWS.DynamoDB.ExportTableToPointInTime(${table.LogicalId}, ${bucket.LogicalId})`)(function* (request) {
            return yield* exportTableToPointInTime({
                ...request,
                TableArn: yield* TableArn,
                S3Bucket: yield* S3Bucket,
            });
        });
    });
}));
//# sourceMappingURL=ExportTableToPointInTimeHttp.js.map