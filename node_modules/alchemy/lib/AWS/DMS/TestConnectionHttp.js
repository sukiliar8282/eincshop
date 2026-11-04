import * as dms from "@distilled.cloud/aws/database-migration-service";
import * as Layer from "effect/Layer";
import { makeDmsConnectionScopedHttpBinding } from "./BindingHttp.js";
import { TestConnection } from "./TestConnection.js";
export const TestConnectionHttp = Layer.effect(TestConnection, makeDmsConnectionScopedHttpBinding({
    tag: "AWS.DMS.TestConnection",
    actions: ["dms:TestConnection"],
    operation: dms.testConnection,
}));
//# sourceMappingURL=TestConnectionHttp.js.map