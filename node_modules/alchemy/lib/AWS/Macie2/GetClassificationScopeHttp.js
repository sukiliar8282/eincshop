import * as macie2 from "@distilled.cloud/aws/macie2";
import * as Layer from "effect/Layer";
import { makeMacie2HttpBinding } from "./BindingHttp.js";
import { GetClassificationScope } from "./GetClassificationScope.js";
export const GetClassificationScopeHttp = Layer.effect(GetClassificationScope, makeMacie2HttpBinding({
    tag: "AWS.Macie2.GetClassificationScope",
    operation: macie2.getClassificationScope,
    actions: ["macie2:GetClassificationScope"],
}));
//# sourceMappingURL=GetClassificationScopeHttp.js.map