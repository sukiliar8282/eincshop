import * as schemas from "@distilled.cloud/aws/schemas";
import * as Layer from "effect/Layer";
import { makeSchemasSchemaHttpBinding } from "./BindingHttp.js";
import { ExportSchema } from "./ExportSchema.js";
export const ExportSchemaHttp = Layer.effect(ExportSchema, makeSchemasSchemaHttpBinding({
    tag: "AWS.Schemas.ExportSchema",
    operation: schemas.exportSchema,
    actions: ["schemas:ExportSchema"],
}));
//# sourceMappingURL=ExportSchemaHttp.js.map