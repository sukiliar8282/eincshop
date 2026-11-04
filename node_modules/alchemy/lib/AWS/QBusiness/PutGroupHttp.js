import * as qbusiness from "@distilled.cloud/aws/qbusiness";
import * as Layer from "effect/Layer";
import { makeQBusinessIndexHttpBinding } from "./BindingHttp.js";
import { PutGroup } from "./PutGroup.js";
export const PutGroupHttp = Layer.effect(PutGroup, makeQBusinessIndexHttpBinding({
    tag: "AWS.QBusiness.PutGroup",
    operation: qbusiness.putGroup,
    actions: ["qbusiness:PutGroup"],
    subResources: ["data-source/*"],
}));
//# sourceMappingURL=PutGroupHttp.js.map