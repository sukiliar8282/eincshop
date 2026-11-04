import * as Kinesis from "@distilled.cloud/aws/kinesis";
import * as Layer from "effect/Layer";
import { makeKinesisAccountHttpBinding } from "./BindingHttp.js";
import { ListStreams } from "./ListStreams.js";
export const ListStreamsHttp = Layer.effect(ListStreams, makeKinesisAccountHttpBinding({
    tag: "AWS.Kinesis.ListStreams",
    operation: Kinesis.listStreams,
    actions: ["kinesis:ListStreams"],
}));
//# sourceMappingURL=ListStreamsHttp.js.map