import * as serverless from "@distilled.cloud/aws/redshift-serverless";
import * as Layer from "effect/Layer";
import { makeServerlessAccountHttpBinding } from "./BindingHttp.js";
import { GetTableRestoreStatus } from "./GetTableRestoreStatus.js";
export const GetTableRestoreStatusHttp = Layer.effect(GetTableRestoreStatus, makeServerlessAccountHttpBinding({
    tag: "AWS.RedshiftServerless.GetTableRestoreStatus",
    operation: serverless.getTableRestoreStatus,
    actions: ["redshift-serverless:GetTableRestoreStatus"],
}));
//# sourceMappingURL=GetTableRestoreStatusHttp.js.map