import * as kafka from "@distilled.cloud/aws/kafka";
import * as Layer from "effect/Layer";
import { makeKafkaClusterHttpBinding } from "./BindingHttp.js";
import { DescribeTopic } from "./DescribeTopic.js";
export const DescribeTopicHttp = Layer.effect(DescribeTopic, makeKafkaClusterHttpBinding({
    tag: "AWS.Kafka.DescribeTopic",
    operation: kafka.describeTopic,
    actions: [
        "kafka:DescribeTopic",
        "kafka-cluster:Connect",
        "kafka-cluster:DescribeTopic",
        "kafka-cluster:DescribeTopicDynamicConfiguration",
    ],
    topicScoped: true,
}));
//# sourceMappingURL=DescribeTopicHttp.js.map