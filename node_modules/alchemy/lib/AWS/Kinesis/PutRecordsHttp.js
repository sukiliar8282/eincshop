import * as Kinesis from "@distilled.cloud/aws/kinesis";
import * as Layer from "effect/Layer";
import { makeStreamHttpBinding } from "./BindingHttp.js";
import { PutRecords } from "./PutRecords.js";
export const PutRecordsHttp = Layer.effect(PutRecords, makeStreamHttpBinding({
    tag: "AWS.Kinesis.PutRecords",
    operation: Kinesis.putRecords,
    actions: ["kinesis:PutRecords"],
    key: "StreamName",
}));
//# sourceMappingURL=PutRecordsHttp.js.map