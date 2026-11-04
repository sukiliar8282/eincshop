import * as kafka from "@distilled.cloud/aws/kafka";
import * as Layer from "effect/Layer";
import { makeKafkaClusterHttpBinding } from "./BindingHttp.js";
import { UpdateTopic } from "./UpdateTopic.js";
export const UpdateTopicHttp = Layer.effect(UpdateTopic, makeKafkaClusterHttpBinding({
    tag: "AWS.Kafka.UpdateTopic",
    operation: kafka.updateTopic,
    actions: [
        "kafka:UpdateTopic",
        "kafka-cluster:Connect",
        "kafka-cluster:AlterTopic",
        "kafka-cluster:AlterTopicDynamicConfiguration",
    ],
    topicScoped: true,
}));
//# sourceMappingURL=UpdateTopicHttp.js.map