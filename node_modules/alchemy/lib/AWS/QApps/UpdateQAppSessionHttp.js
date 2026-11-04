import * as qapps from "@distilled.cloud/aws/qapps";
import * as Layer from "effect/Layer";
import { makeQAppHttpBinding } from "./BindingHttp.js";
import { UpdateQAppSession } from "./UpdateQAppSession.js";
export const UpdateQAppSessionHttp = Layer.effect(UpdateQAppSession, makeQAppHttpBinding({
    capability: "UpdateQAppSession",
    iamActions: ["qapps:UpdateQAppSession"],
    operation: qapps.updateQAppSession,
}));
//# sourceMappingURL=UpdateQAppSessionHttp.js.map