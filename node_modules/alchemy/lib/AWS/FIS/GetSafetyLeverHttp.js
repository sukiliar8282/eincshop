import * as fis from "@distilled.cloud/aws/fis";
import * as Layer from "effect/Layer";
import { makeFisAccountHttpBinding } from "./BindingHttp.js";
import { GetSafetyLever } from "./GetSafetyLever.js";
export const GetSafetyLeverHttp = Layer.effect(GetSafetyLever, makeFisAccountHttpBinding({
    tag: "AWS.FIS.GetSafetyLever",
    operation: fis.getSafetyLever,
    actions: ["fis:GetSafetyLever"],
}));
//# sourceMappingURL=GetSafetyLeverHttp.js.map