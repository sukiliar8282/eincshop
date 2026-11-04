import * as bcm from "@distilled.cloud/aws/bcm-data-exports";
import * as Layer from "effect/Layer";
import { makeDataExportsAccountHttpBinding } from "./BindingHttp.js";
import { ListTables } from "./ListTables.js";
export const ListTablesHttp = Layer.effect(ListTables, makeDataExportsAccountHttpBinding({
    capability: "ListTables",
    iamActions: ["bcm-data-exports:ListTables"],
    operation: bcm.listTables,
}));
//# sourceMappingURL=ListTablesHttp.js.map