import * as lf from "@distilled.cloud/aws/lakeformation";
import * as Layer from "effect/Layer";
import { makeLakeFormationHttpBinding } from "./BindingHttp.js";
import { GetResourceLFTags } from "./GetResourceLFTags.js";
export const GetResourceLFTagsHttp = Layer.effect(GetResourceLFTags, makeLakeFormationHttpBinding({
    capability: "GetResourceLFTags",
    iamActions: ["lakeformation:GetResourceLFTags"],
    operation: lf.getResourceLFTags,
}));
//# sourceMappingURL=GetResourceLFTagsHttp.js.map