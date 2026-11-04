import * as lf from "@distilled.cloud/aws/lakeformation";
import * as Layer from "effect/Layer";
import { makeLakeFormationHttpBinding } from "./BindingHttp.js";
import { GetEffectivePermissionsForPath } from "./GetEffectivePermissionsForPath.js";
export const GetEffectivePermissionsForPathHttp = Layer.effect(GetEffectivePermissionsForPath, makeLakeFormationHttpBinding({
    capability: "GetEffectivePermissionsForPath",
    iamActions: ["lakeformation:GetEffectivePermissionsForPath"],
    operation: lf.getEffectivePermissionsForPath,
}));
//# sourceMappingURL=GetEffectivePermissionsForPathHttp.js.map