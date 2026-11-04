import * as athena from "@distilled.cloud/aws/athena";
import * as Layer from "effect/Layer";
import { makeDataCatalogScopedHttpBinding } from "./BindingHttp.js";
import { GetTableMetadata } from "./GetTableMetadata.js";
export const GetTableMetadataHttp = Layer.effect(GetTableMetadata, makeDataCatalogScopedHttpBinding({
    tag: "AWS.Athena.GetTableMetadata",
    operation: athena.getTableMetadata,
    actions: ["athena:GetTableMetadata"],
}));
//# sourceMappingURL=GetTableMetadataHttp.js.map