import * as textract from "@distilled.cloud/aws/textract";
import * as Layer from "effect/Layer";
import { makeTextractAdapterHttpBinding } from "./BindingHttp.js";
import { GetAdapterVersion } from "./GetAdapterVersion.js";
export const GetAdapterVersionHttp = Layer.effect(GetAdapterVersion, makeTextractAdapterHttpBinding({
    capability: "GetAdapterVersion",
    iamActions: ["textract:GetAdapterVersion"],
    operation: textract.getAdapterVersion,
}));
//# sourceMappingURL=GetAdapterVersionHttp.js.map