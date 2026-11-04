import * as mq from "@distilled.cloud/aws/mq";
import * as Layer from "effect/Layer";
import { makeMqAccountHttpBinding } from "./BindingHttp.js";
import { ListBrokers } from "./ListBrokers.js";
export const ListBrokersHttp = Layer.effect(ListBrokers, makeMqAccountHttpBinding({
    capability: "ListBrokers",
    operation: mq.listBrokers,
    iamActions: ["mq:ListBrokers"],
}));
//# sourceMappingURL=ListBrokersHttp.js.map