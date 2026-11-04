import * as serverless from "@distilled.cloud/aws/redshift-serverless";
import * as Layer from "effect/Layer";
import { makeServerlessAccountHttpBinding } from "./BindingHttp.js";
import { ListRecoveryPoints } from "./ListRecoveryPoints.js";
export const ListRecoveryPointsHttp = Layer.effect(ListRecoveryPoints, makeServerlessAccountHttpBinding({
    tag: "AWS.RedshiftServerless.ListRecoveryPoints",
    operation: serverless.listRecoveryPoints,
    actions: ["redshift-serverless:ListRecoveryPoints"],
}));
//# sourceMappingURL=ListRecoveryPointsHttp.js.map