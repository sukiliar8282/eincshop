import * as mq from "@distilled.cloud/aws/mq";
import * as Layer from "effect/Layer";
import { makeMqBrokerHttpBinding } from "./BindingHttp.js";
import { Promote } from "./Promote.js";
export const PromoteHttp = Layer.effect(Promote, makeMqBrokerHttpBinding({
    capability: "Promote",
    operation: mq.promote,
    iamActions: ["mq:Promote"],
}));
//# sourceMappingURL=PromoteHttp.js.map