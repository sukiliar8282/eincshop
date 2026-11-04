import * as kafka from "@distilled.cloud/aws/kafka";
import * as Layer from "effect/Layer";
import { makeKafkaClusterHttpBinding } from "./BindingHttp.js";
import { DescribeTopicPartitions } from "./DescribeTopicPartitions.js";
export const DescribeTopicPartitionsHttp = Layer.effect(DescribeTopicPartitions, makeKafkaClusterHttpBinding({
    tag: "AWS.Kafka.DescribeTopicPartitions",
    operation: kafka.describeTopicPartitions,
    actions: [
        "kafka:DescribeTopicPartitions",
        "kafka-cluster:Connect",
        "kafka-cluster:DescribeTopic",
    ],
    topicScoped: true,
}));
//# sourceMappingURL=DescribeTopicPartitionsHttp.js.map