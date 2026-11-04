import * as glue from "@distilled.cloud/aws/glue";
import * as Layer from "effect/Layer";
import { makeGlueTableHttpBinding } from "./BindingHttp.js";
import { UpdatePartition } from "./UpdatePartition.js";
export const UpdatePartitionHttp = Layer.effect(UpdatePartition, makeGlueTableHttpBinding({
    tag: "AWS.Glue.UpdatePartition",
    operation: glue.updatePartition,
    actions: ["glue:UpdatePartition"],
    tableNameKey: "TableName",
}));
//# sourceMappingURL=UpdatePartitionHttp.js.map