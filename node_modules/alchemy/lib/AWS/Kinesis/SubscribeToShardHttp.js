import * as Kinesis from "@distilled.cloud/aws/kinesis";
import * as Layer from "effect/Layer";
import { makeConsumerHttpBinding } from "./BindingHttp.js";
import { SubscribeToShard } from "./SubscribeToShard.js";
export const SubscribeToShardHttp = Layer.effect(SubscribeToShard, makeConsumerHttpBinding({
    tag: "AWS.Kinesis.SubscribeToShard",
    operation: Kinesis.subscribeToShard,
    actions: ["kinesis:SubscribeToShard"],
}));
//# sourceMappingURL=SubscribeToShardHttp.js.map