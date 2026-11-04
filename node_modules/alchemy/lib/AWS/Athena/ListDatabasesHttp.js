import * as athena from "@distilled.cloud/aws/athena";
import * as Layer from "effect/Layer";
import { makeDataCatalogScopedHttpBinding } from "./BindingHttp.js";
import { ListDatabases } from "./ListDatabases.js";
export const ListDatabasesHttp = Layer.effect(ListDatabases, makeDataCatalogScopedHttpBinding({
    tag: "AWS.Athena.ListDatabases",
    operation: athena.listDatabases,
    actions: ["athena:ListDatabases"],
}));
//# sourceMappingURL=ListDatabasesHttp.js.map