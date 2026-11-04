import * as qbusiness from "@distilled.cloud/aws/qbusiness";
import * as Layer from "effect/Layer";
import { makeQBusinessIndexHttpBinding } from "./BindingHttp.js";
import { GetGroup } from "./GetGroup.js";
export const GetGroupHttp = Layer.effect(GetGroup, makeQBusinessIndexHttpBinding({
    tag: "AWS.QBusiness.GetGroup",
    operation: qbusiness.getGroup,
    actions: ["qbusiness:GetGroup"],
    subResources: ["data-source/*"],
}));
//# sourceMappingURL=GetGroupHttp.js.map