import * as athena from "@distilled.cloud/aws/athena";
import * as Layer from "effect/Layer";
import { makeDataCatalogScopedHttpBinding } from "./BindingHttp.js";
import { GetDatabase } from "./GetDatabase.js";
export const GetDatabaseHttp = Layer.effect(GetDatabase, makeDataCatalogScopedHttpBinding({
    tag: "AWS.Athena.GetDatabase",
    operation: athena.getDatabase,
    actions: ["athena:GetDatabase"],
}));
//# sourceMappingURL=GetDatabaseHttp.js.map