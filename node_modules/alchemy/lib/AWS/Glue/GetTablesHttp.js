import * as glue from "@distilled.cloud/aws/glue";
import * as Layer from "effect/Layer";
import { makeGlueDatabaseHttpBinding } from "./BindingHttp.js";
import { GetTables } from "./GetTables.js";
export const GetTablesHttp = Layer.effect(GetTables, makeGlueDatabaseHttpBinding({
    tag: "AWS.Glue.GetTables",
    operation: glue.getTables,
    actions: ["glue:GetTables"],
}));
//# sourceMappingURL=GetTablesHttp.js.map