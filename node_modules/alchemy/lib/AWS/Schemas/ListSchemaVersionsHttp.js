import * as schemas from "@distilled.cloud/aws/schemas";
import * as Layer from "effect/Layer";
import { makeSchemasSchemaHttpBinding } from "./BindingHttp.js";
import { ListSchemaVersions } from "./ListSchemaVersions.js";
export const ListSchemaVersionsHttp = Layer.effect(ListSchemaVersions, makeSchemasSchemaHttpBinding({
    tag: "AWS.Schemas.ListSchemaVersions",
    operation: schemas.listSchemaVersions,
    actions: ["schemas:ListSchemaVersions"],
}));
//# sourceMappingURL=ListSchemaVersionsHttp.js.map