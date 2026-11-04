import * as glue from "@distilled.cloud/aws/glue";
import * as Layer from "effect/Layer";
import { makeGlueTableHttpBinding } from "./BindingHttp.js";
import { GetTable } from "./GetTable.js";
export const GetTableHttp = Layer.effect(GetTable, makeGlueTableHttpBinding({
    tag: "AWS.Glue.GetTable",
    operation: glue.getTable,
    actions: ["glue:GetTable"],
    tableNameKey: "Name",
}));
//# sourceMappingURL=GetTableHttp.js.map