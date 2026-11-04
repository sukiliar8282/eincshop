import * as qbusiness from "@distilled.cloud/aws/qbusiness";
import * as Layer from "effect/Layer";
import { makeQBusinessApplicationHttpBinding } from "./BindingHttp.js";
import { DisassociatePermission } from "./DisassociatePermission.js";
export const DisassociatePermissionHttp = Layer.effect(DisassociatePermission, makeQBusinessApplicationHttpBinding({
    tag: "AWS.QBusiness.DisassociatePermission",
    operation: qbusiness.disassociatePermission,
    actions: ["qbusiness:DisassociatePermission"],
}));
//# sourceMappingURL=DisassociatePermissionHttp.js.map