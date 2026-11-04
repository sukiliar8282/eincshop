import * as macie2 from "@distilled.cloud/aws/macie2";
import * as Layer from "effect/Layer";
import { makeMacie2HttpBinding } from "./BindingHttp.js";
import { GetFindings } from "./GetFindings.js";
export const GetFindingsHttp = Layer.effect(GetFindings, makeMacie2HttpBinding({
    tag: "AWS.Macie2.GetFindings",
    operation: macie2.getFindings,
    actions: ["macie2:GetFindings"],
}));
//# sourceMappingURL=GetFindingsHttp.js.map