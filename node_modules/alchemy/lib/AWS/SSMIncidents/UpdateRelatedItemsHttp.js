import * as incidents from "@distilled.cloud/aws/ssm-incidents";
import * as Layer from "effect/Layer";
import { makeIncidentsAccountHttpBinding } from "./BindingHttp.js";
import { UpdateRelatedItems } from "./UpdateRelatedItems.js";
export const UpdateRelatedItemsHttp = Layer.effect(UpdateRelatedItems, makeIncidentsAccountHttpBinding({
    tag: "AWS.SSMIncidents.UpdateRelatedItems",
    operation: incidents.updateRelatedItems,
    actions: ["ssm-incidents:UpdateRelatedItems"],
}));
//# sourceMappingURL=UpdateRelatedItemsHttp.js.map