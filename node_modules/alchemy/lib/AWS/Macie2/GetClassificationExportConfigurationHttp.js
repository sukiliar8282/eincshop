import * as macie2 from "@distilled.cloud/aws/macie2";
import * as Layer from "effect/Layer";
import { makeMacie2HttpBinding } from "./BindingHttp.js";
import { GetClassificationExportConfiguration } from "./GetClassificationExportConfiguration.js";
export const GetClassificationExportConfigurationHttp = Layer.effect(GetClassificationExportConfiguration, makeMacie2HttpBinding({
    tag: "AWS.Macie2.GetClassificationExportConfiguration",
    operation: macie2.getClassificationExportConfiguration,
    actions: ["macie2:GetClassificationExportConfiguration"],
}));
//# sourceMappingURL=GetClassificationExportConfigurationHttp.js.map