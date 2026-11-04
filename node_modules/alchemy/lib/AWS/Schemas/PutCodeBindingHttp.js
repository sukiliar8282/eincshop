import * as schemas from "@distilled.cloud/aws/schemas";
import * as Layer from "effect/Layer";
import { makeSchemasSchemaHttpBinding } from "./BindingHttp.js";
import { PutCodeBinding } from "./PutCodeBinding.js";
export const PutCodeBindingHttp = Layer.effect(PutCodeBinding, makeSchemasSchemaHttpBinding({
    tag: "AWS.Schemas.PutCodeBinding",
    operation: schemas.putCodeBinding,
    actions: ["schemas:PutCodeBinding"],
}));
//# sourceMappingURL=PutCodeBindingHttp.js.map