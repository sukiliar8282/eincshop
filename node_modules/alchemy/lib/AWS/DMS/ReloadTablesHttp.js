import * as dms from "@distilled.cloud/aws/database-migration-service";
import * as Layer from "effect/Layer";
import { makeDmsAccountHttpBinding } from "./BindingHttp.js";
import { ReloadTables } from "./ReloadTables.js";
export const ReloadTablesHttp = Layer.effect(ReloadTables, makeDmsAccountHttpBinding({
    tag: "AWS.DMS.ReloadTables",
    actions: ["dms:ReloadTables"],
    operation: dms.reloadTables,
}));
//# sourceMappingURL=ReloadTablesHttp.js.map