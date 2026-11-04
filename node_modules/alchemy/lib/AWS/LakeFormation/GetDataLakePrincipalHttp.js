import * as lf from "@distilled.cloud/aws/lakeformation";
import * as Layer from "effect/Layer";
import { makeLakeFormationHttpBinding } from "./BindingHttp.js";
import { GetDataLakePrincipal } from "./GetDataLakePrincipal.js";
export const GetDataLakePrincipalHttp = Layer.effect(GetDataLakePrincipal, makeLakeFormationHttpBinding({
    capability: "GetDataLakePrincipal",
    iamActions: ["lakeformation:GetDataLakePrincipal"],
    operation: lf.getDataLakePrincipal,
}));
//# sourceMappingURL=GetDataLakePrincipalHttp.js.map