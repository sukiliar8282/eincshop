import * as finspace from "@distilled.cloud/aws/finspace";
import * as Layer from "effect/Layer";
import { makeFinSpaceKxHttpBinding } from "./BindingHttp.js";
import { UpdateKxClusterDatabases } from "./UpdateKxClusterDatabases.js";
export const UpdateKxClusterDatabasesHttp = Layer.effect(UpdateKxClusterDatabases, makeFinSpaceKxHttpBinding({
    tag: "AWS.FinSpace.UpdateKxClusterDatabases",
    operation: finspace.updateKxClusterDatabases,
    actions: ["finspace:UpdateKxClusterDatabases"],
}));
//# sourceMappingURL=UpdateKxClusterDatabasesHttp.js.map