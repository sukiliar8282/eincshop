import * as serverless from "@distilled.cloud/aws/redshift-serverless";
import * as Layer from "effect/Layer";
import { makeServerlessAccountHttpBinding } from "./BindingHttp.js";
import { ListTableRestoreStatus } from "./ListTableRestoreStatus.js";
export const ListTableRestoreStatusHttp = Layer.effect(ListTableRestoreStatus, makeServerlessAccountHttpBinding({
    tag: "AWS.RedshiftServerless.ListTableRestoreStatus",
    operation: serverless.listTableRestoreStatus,
    actions: ["redshift-serverless:ListTableRestoreStatus"],
}));
//# sourceMappingURL=ListTableRestoreStatusHttp.js.map