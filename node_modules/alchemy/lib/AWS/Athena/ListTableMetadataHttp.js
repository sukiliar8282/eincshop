import * as athena from "@distilled.cloud/aws/athena";
import * as Layer from "effect/Layer";
import { makeDataCatalogScopedHttpBinding } from "./BindingHttp.js";
import { ListTableMetadata } from "./ListTableMetadata.js";
export const ListTableMetadataHttp = Layer.effect(ListTableMetadata, makeDataCatalogScopedHttpBinding({
    tag: "AWS.Athena.ListTableMetadata",
    operation: athena.listTableMetadata,
    actions: ["athena:ListTableMetadata"],
}));
//# sourceMappingURL=ListTableMetadataHttp.js.map