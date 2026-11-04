import * as mq from "@distilled.cloud/aws/mq";
import * as Layer from "effect/Layer";
import { makeMqBrokerHttpBinding } from "./BindingHttp.js";
import { RebootBroker } from "./RebootBroker.js";
export const RebootBrokerHttp = Layer.effect(RebootBroker, makeMqBrokerHttpBinding({
    capability: "RebootBroker",
    operation: mq.rebootBroker,
    iamActions: ["mq:RebootBroker"],
}));
//# sourceMappingURL=RebootBrokerHttp.js.map