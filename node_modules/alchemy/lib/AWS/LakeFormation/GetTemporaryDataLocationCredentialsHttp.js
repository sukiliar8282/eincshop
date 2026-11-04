import * as lf from "@distilled.cloud/aws/lakeformation";
import * as Layer from "effect/Layer";
import { makeLakeFormationHttpBinding } from "./BindingHttp.js";
import { GetTemporaryDataLocationCredentials } from "./GetTemporaryDataLocationCredentials.js";
export const GetTemporaryDataLocationCredentialsHttp = Layer.effect(GetTemporaryDataLocationCredentials, makeLakeFormationHttpBinding({
    capability: "GetTemporaryDataLocationCredentials",
    iamActions: ["lakeformation:GetDataAccess"],
    operation: lf.getTemporaryDataLocationCredentials,
}));
//# sourceMappingURL=GetTemporaryDataLocationCredentialsHttp.js.map