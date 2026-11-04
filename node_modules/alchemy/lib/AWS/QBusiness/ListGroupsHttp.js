import * as qbusiness from "@distilled.cloud/aws/qbusiness";
import * as Layer from "effect/Layer";
import { makeQBusinessIndexHttpBinding } from "./BindingHttp.js";
import { ListGroups } from "./ListGroups.js";
export const ListGroupsHttp = Layer.effect(ListGroups, makeQBusinessIndexHttpBinding({
    tag: "AWS.QBusiness.ListGroups",
    operation: qbusiness.listGroups,
    actions: ["qbusiness:ListGroups"],
    subResources: ["data-source/*"],
}));
//# sourceMappingURL=ListGroupsHttp.js.map