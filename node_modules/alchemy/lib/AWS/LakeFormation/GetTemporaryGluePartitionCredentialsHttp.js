import * as lf from "@distilled.cloud/aws/lakeformation";
import * as Layer from "effect/Layer";
import { makeLakeFormationHttpBinding } from "./BindingHttp.js";
import { GetTemporaryGluePartitionCredentials } from "./GetTemporaryGluePartitionCredentials.js";
export const GetTemporaryGluePartitionCredentialsHttp = Layer.effect(GetTemporaryGluePartitionCredentials, makeLakeFormationHttpBinding({
    capability: "GetTemporaryGluePartitionCredentials",
    iamActions: ["lakeformation:GetDataAccess"],
    operation: lf.getTemporaryGluePartitionCredentials,
}));
//# sourceMappingURL=GetTemporaryGluePartitionCredentialsHttp.js.map