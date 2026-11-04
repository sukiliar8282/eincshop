import * as Kinesis from "@distilled.cloud/aws/kinesis";
import * as Layer from "effect/Layer";
import { makeStreamHttpBinding } from "./BindingHttp.js";
import { ListShards } from "./ListShards.js";
export const ListShardsHttp = Layer.effect(ListShards, makeStreamHttpBinding({
    tag: "AWS.Kinesis.ListShards",
    operation: Kinesis.listShards,
    actions: ["kinesis:ListShards"],
    key: "StreamARN",
}));
//# sourceMappingURL=ListShardsHttp.js.map