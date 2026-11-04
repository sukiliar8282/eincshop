import * as schemas from "@distilled.cloud/aws/schemas";
import * as Layer from "effect/Layer";
import { makeSchemasSchemaHttpBinding } from "./BindingHttp.js";
import { GetCodeBindingSource } from "./GetCodeBindingSource.js";
export const GetCodeBindingSourceHttp = Layer.effect(GetCodeBindingSource, makeSchemasSchemaHttpBinding({
    tag: "AWS.Schemas.GetCodeBindingSource",
    operation: schemas.getCodeBindingSource,
    actions: ["schemas:GetCodeBindingSource"],
}));
//# sourceMappingURL=GetCodeBindingSourceHttp.js.map