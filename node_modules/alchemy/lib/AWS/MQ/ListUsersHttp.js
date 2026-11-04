import * as mq from "@distilled.cloud/aws/mq";
import * as Layer from "effect/Layer";
import { makeMqBrokerHttpBinding } from "./BindingHttp.js";
import { ListUsers } from "./ListUsers.js";
export const ListUsersHttp = Layer.effect(ListUsers, makeMqBrokerHttpBinding({
    capability: "ListUsers",
    operation: mq.listUsers,
    iamActions: ["mq:ListUsers"],
}));
//# sourceMappingURL=ListUsersHttp.js.map