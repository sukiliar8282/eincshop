import * as fms from "@distilled.cloud/aws/fms";
import * as Layer from "effect/Layer";
import { makeFmsHttpBinding } from "./BindingHttp.js";
import { GetResourceSet } from "./GetResourceSet.js";
export const GetResourceSetHttp = Layer.effect(GetResourceSet, makeFmsHttpBinding({
    capability: "GetResourceSet",
    iamActions: ["fms:GetResourceSet"],
    operation: fms.getResourceSet,
}));
//# sourceMappingURL=GetResourceSetHttp.js.map