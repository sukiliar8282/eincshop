import * as kafka from "@distilled.cloud/aws/kafka";
import * as Layer from "effect/Layer";
import { makeKafkaClusterHttpBinding } from "./BindingHttp.js";
import { ListTopics } from "./ListTopics.js";
export const ListTopicsHttp = Layer.effect(ListTopics, makeKafkaClusterHttpBinding({
    tag: "AWS.Kafka.ListTopics",
    operation: kafka.listTopics,
    actions: [
        "kafka:ListTopics",
        "kafka-cluster:Connect",
        "kafka-cluster:DescribeTopic",
    ],
    topicScoped: true,
}));
//# sourceMappingURL=ListTopicsHttp.js.map