import * as serverless from "@distilled.cloud/aws/redshift-serverless";
import * as Layer from "effect/Layer";
import { makeServerlessAccountHttpBinding } from "./BindingHttp.js";
import { GetIdentityCenterAuthToken } from "./GetIdentityCenterAuthToken.js";
export const GetIdentityCenterAuthTokenHttp = Layer.effect(GetIdentityCenterAuthToken, makeServerlessAccountHttpBinding({
    tag: "AWS.RedshiftServerless.GetIdentityCenterAuthToken",
    operation: serverless.getIdentityCenterAuthToken,
    actions: ["redshift-serverless:GetIdentityCenterAuthToken"],
}));
//# sourceMappingURL=GetIdentityCenterAuthTokenHttp.js.map