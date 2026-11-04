import * as kafka from "@distilled.cloud/aws/kafka";
import * as Layer from "effect/Layer";
import { makeKafkaClusterHttpBinding } from "./BindingHttp.js";
import { GetBootstrapBrokers } from "./GetBootstrapBrokers.js";
export const GetBootstrapBrokersHttp = Layer.effect(GetBootstrapBrokers, makeKafkaClusterHttpBinding({
    tag: "AWS.Kafka.GetBootstrapBrokers",
    operation: kafka.getBootstrapBrokers,
    actions: ["kafka:GetBootstrapBrokers"],
}));
//# sourceMappingURL=GetBootstrapBrokersHttp.js.map