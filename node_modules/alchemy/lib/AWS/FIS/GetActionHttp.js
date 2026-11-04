import * as fis from "@distilled.cloud/aws/fis";
import * as Layer from "effect/Layer";
import { makeFisAccountHttpBinding } from "./BindingHttp.js";
import { GetAction } from "./GetAction.js";
export const GetActionHttp = Layer.effect(GetAction, makeFisAccountHttpBinding({
    tag: "AWS.FIS.GetAction",
    operation: fis.getAction,
    actions: ["fis:GetAction"],
}));
//# sourceMappingURL=GetActionHttp.js.map