import * as incidents from "@distilled.cloud/aws/ssm-incidents";
import * as Layer from "effect/Layer";
import { makeIncidentsAccountHttpBinding } from "./BindingHttp.js";
import { ListRelatedItems } from "./ListRelatedItems.js";
export const ListRelatedItemsHttp = Layer.effect(ListRelatedItems, makeIncidentsAccountHttpBinding({
    tag: "AWS.SSMIncidents.ListRelatedItems",
    operation: incidents.listRelatedItems,
    actions: ["ssm-incidents:ListRelatedItems"],
}));
//# sourceMappingURL=ListRelatedItemsHttp.js.map