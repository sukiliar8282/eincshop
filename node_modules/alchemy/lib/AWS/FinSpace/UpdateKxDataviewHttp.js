import * as finspace from "@distilled.cloud/aws/finspace";
import * as Layer from "effect/Layer";
import { makeFinSpaceKxHttpBinding } from "./BindingHttp.js";
import { UpdateKxDataview } from "./UpdateKxDataview.js";
export const UpdateKxDataviewHttp = Layer.effect(UpdateKxDataview, makeFinSpaceKxHttpBinding({
    tag: "AWS.FinSpace.UpdateKxDataview",
    operation: finspace.updateKxDataview,
    actions: ["finspace:UpdateKxDataview"],
}));
//# sourceMappingURL=UpdateKxDataviewHttp.js.map