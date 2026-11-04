import * as lf from "@distilled.cloud/aws/lakeformation";
import * as Layer from "effect/Layer";
import { makeLakeFormationHttpBinding } from "./BindingHttp.js";
import { GetTemporaryGlueTableCredentials } from "./GetTemporaryGlueTableCredentials.js";
export const GetTemporaryGlueTableCredentialsHttp = Layer.effect(GetTemporaryGlueTableCredentials, makeLakeFormationHttpBinding({
    capability: "GetTemporaryGlueTableCredentials",
    iamActions: ["lakeformation:GetDataAccess"],
    operation: lf.getTemporaryGlueTableCredentials,
}));
//# sourceMappingURL=GetTemporaryGlueTableCredentialsHttp.js.map