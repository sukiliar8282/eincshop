import * as lf from "@distilled.cloud/aws/lakeformation";
import * as Layer from "effect/Layer";
import { makeLakeFormationHttpBinding } from "./BindingHttp.js";
import { GetLFTag } from "./GetLFTag.js";
export const GetLFTagHttp = Layer.effect(GetLFTag, makeLakeFormationHttpBinding({
    capability: "GetLFTag",
    iamActions: ["lakeformation:GetLFTag"],
    operation: lf.getLFTag,
}));
//# sourceMappingURL=GetLFTagHttp.js.map