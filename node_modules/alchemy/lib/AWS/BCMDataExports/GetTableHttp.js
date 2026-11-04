import * as bcm from "@distilled.cloud/aws/bcm-data-exports";
import * as Layer from "effect/Layer";
import { makeDataExportsAccountHttpBinding } from "./BindingHttp.js";
import { GetTable } from "./GetTable.js";
export const GetTableHttp = Layer.effect(GetTable, makeDataExportsAccountHttpBinding({
    capability: "GetTable",
    iamActions: ["bcm-data-exports:GetTable"],
    operation: bcm.getTable,
}));
//# sourceMappingURL=GetTableHttp.js.map