import * as mq from "@distilled.cloud/aws/mq";
import * as Layer from "effect/Layer";
import { makeMqBrokerHttpBinding } from "./BindingHttp.js";
import { UpdateUser } from "./UpdateUser.js";
export const UpdateUserHttp = Layer.effect(UpdateUser, makeMqBrokerHttpBinding({
    capability: "UpdateUser",
    operation: mq.updateUser,
    iamActions: ["mq:UpdateUser"],
}));
//# sourceMappingURL=UpdateUserHttp.js.map