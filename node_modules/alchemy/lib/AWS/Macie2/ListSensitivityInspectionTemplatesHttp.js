import * as macie2 from "@distilled.cloud/aws/macie2";
import * as Layer from "effect/Layer";
import { makeMacie2HttpBinding } from "./BindingHttp.js";
import { ListSensitivityInspectionTemplates } from "./ListSensitivityInspectionTemplates.js";
export const ListSensitivityInspectionTemplatesHttp = Layer.effect(ListSensitivityInspectionTemplates, makeMacie2HttpBinding({
    tag: "AWS.Macie2.ListSensitivityInspectionTemplates",
    operation: macie2.listSensitivityInspectionTemplates,
    actions: ["macie2:ListSensitivityInspectionTemplates"],
}));
//# sourceMappingURL=ListSensitivityInspectionTemplatesHttp.js.map