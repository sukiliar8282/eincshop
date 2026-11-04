import * as finspace from "@distilled.cloud/aws/finspace";
import * as Layer from "effect/Layer";
import { makeFinSpaceKxHttpBinding } from "./BindingHttp.js";
import { UpdateKxUser } from "./UpdateKxUser.js";
export const UpdateKxUserHttp = Layer.effect(UpdateKxUser, makeFinSpaceKxHttpBinding({
    tag: "AWS.FinSpace.UpdateKxUser",
    operation: finspace.updateKxUser,
    actions: ["finspace:UpdateKxUser"],
}));
//# sourceMappingURL=UpdateKxUserHttp.js.map