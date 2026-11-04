import * as mq from "@distilled.cloud/aws/mq";
import * as Layer from "effect/Layer";
import { makeMqBrokerHttpBinding } from "./BindingHttp.js";
import { DescribeUser } from "./DescribeUser.js";
export const DescribeUserHttp = Layer.effect(DescribeUser, makeMqBrokerHttpBinding({
    capability: "DescribeUser",
    operation: mq.describeUser,
    iamActions: ["mq:DescribeUser"],
}));
//# sourceMappingURL=DescribeUserHttp.js.map