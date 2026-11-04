import * as s3tables from "@distilled.cloud/aws/s3tables";
import * as Layer from "effect/Layer";
import { makeS3TablesTableHttpBinding } from "./BindingHttp.js";
import { GetTable } from "./GetTable.js";
export const GetTableHttp = Layer.effect(GetTable, makeS3TablesTableHttpBinding({
    tag: "AWS.S3Tables.GetTable",
    operation: s3tables.getTable,
    actions: ["s3tables:GetTable"],
}));
//# sourceMappingURL=GetTableHttp.js.map