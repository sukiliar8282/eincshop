import * as schemas from "@distilled.cloud/aws/schemas";
import * as Layer from "effect/Layer";
import { makeSchemasRegistryHttpBinding } from "./BindingHttp.js";
import { SearchSchemas } from "./SearchSchemas.js";
export const SearchSchemasHttp = Layer.effect(SearchSchemas, makeSchemasRegistryHttpBinding({
    tag: "AWS.Schemas.SearchSchemas",
    operation: schemas.searchSchemas,
    actions: ["schemas:SearchSchemas"],
}));
//# sourceMappingURL=SearchSchemasHttp.js.map