import * as dms from "@distilled.cloud/aws/database-migration-service";
import * as Layer from "effect/Layer";
import { makeDmsConnectionScopedHttpBinding } from "./BindingHttp.js";
import { RefreshSchemas } from "./RefreshSchemas.js";
export const RefreshSchemasHttp = Layer.effect(RefreshSchemas, makeDmsConnectionScopedHttpBinding({
    tag: "AWS.DMS.RefreshSchemas",
    actions: ["dms:RefreshSchemas"],
    operation: dms.refreshSchemas,
}));
//# sourceMappingURL=RefreshSchemasHttp.js.map