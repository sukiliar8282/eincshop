import * as qapps from "@distilled.cloud/aws/qapps";
import * as Layer from "effect/Layer";
import { makeQAppHttpBinding } from "./BindingHttp.js";
import { DisassociateQAppFromUser } from "./DisassociateQAppFromUser.js";
export const DisassociateQAppFromUserHttp = Layer.effect(DisassociateQAppFromUser, makeQAppHttpBinding({
    capability: "DisassociateQAppFromUser",
    iamActions: ["qapps:DisassociateQAppFromUser"],
    operation: qapps.disassociateQAppFromUser,
    injectAppId: true,
}));
//# sourceMappingURL=DisassociateQAppFromUserHttp.js.map