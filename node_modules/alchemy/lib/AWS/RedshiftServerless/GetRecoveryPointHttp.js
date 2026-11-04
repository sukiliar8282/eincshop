import * as serverless from "@distilled.cloud/aws/redshift-serverless";
import * as Layer from "effect/Layer";
import { makeServerlessAccountHttpBinding } from "./BindingHttp.js";
import { GetRecoveryPoint } from "./GetRecoveryPoint.js";
export const GetRecoveryPointHttp = Layer.effect(GetRecoveryPoint, makeServerlessAccountHttpBinding({
    tag: "AWS.RedshiftServerless.GetRecoveryPoint",
    operation: serverless.getRecoveryPoint,
    actions: ["redshift-serverless:GetRecoveryPoint"],
}));
//# sourceMappingURL=GetRecoveryPointHttp.js.map