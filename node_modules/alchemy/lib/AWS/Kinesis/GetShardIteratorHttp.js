import * as Kinesis from "@distilled.cloud/aws/kinesis";
import * as Layer from "effect/Layer";
import { makeStreamHttpBinding } from "./BindingHttp.js";
import { GetShardIterator } from "./GetShardIterator.js";
export const GetShardIteratorHttp = Layer.effect(GetShardIterator, makeStreamHttpBinding({
    tag: "AWS.Kinesis.GetShardIterator",
    operation: Kinesis.getShardIterator,
    actions: ["kinesis:GetShardIterator"],
    key: "StreamARN",
}));
//# sourceMappingURL=GetShardIteratorHttp.js.map