import * as glue from "@distilled.cloud/aws/glue";
import * as Layer from "effect/Layer";
import { makeGlueTableHttpBinding } from "./BindingHttp.js";
import { GetPartitions } from "./GetPartitions.js";
export const GetPartitionsHttp = Layer.effect(GetPartitions, makeGlueTableHttpBinding({
    tag: "AWS.Glue.GetPartitions",
    operation: glue.getPartitions,
    actions: ["glue:GetPartitions"],
    tableNameKey: "TableName",
}));
//# sourceMappingURL=GetPartitionsHttp.js.map