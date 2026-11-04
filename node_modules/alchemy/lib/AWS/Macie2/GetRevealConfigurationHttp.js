import * as macie2 from "@distilled.cloud/aws/macie2";
import * as Layer from "effect/Layer";
import { makeMacie2HttpBinding } from "./BindingHttp.js";
import { GetRevealConfiguration } from "./GetRevealConfiguration.js";
export const GetRevealConfigurationHttp = Layer.effect(GetRevealConfiguration, makeMacie2HttpBinding({
    tag: "AWS.Macie2.GetRevealConfiguration",
    operation: macie2.getRevealConfiguration,
    actions: ["macie2:GetRevealConfiguration"],
}));
//# sourceMappingURL=GetRevealConfigurationHttp.js.map