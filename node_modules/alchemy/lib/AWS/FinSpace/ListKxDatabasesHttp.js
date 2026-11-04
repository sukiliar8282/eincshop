import * as finspace from "@distilled.cloud/aws/finspace";
import * as Layer from "effect/Layer";
import { makeFinSpaceKxHttpBinding } from "./BindingHttp.js";
import { ListKxDatabases } from "./ListKxDatabases.js";
export const ListKxDatabasesHttp = Layer.effect(ListKxDatabases, makeFinSpaceKxHttpBinding({
    tag: "AWS.FinSpace.ListKxDatabases",
    operation: finspace.listKxDatabases,
    actions: ["finspace:ListKxDatabases"],
}));
//# sourceMappingURL=ListKxDatabasesHttp.js.map