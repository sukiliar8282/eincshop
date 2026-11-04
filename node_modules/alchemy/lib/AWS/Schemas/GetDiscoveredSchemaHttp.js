import * as schemas from "@distilled.cloud/aws/schemas";
import * as Layer from "effect/Layer";
import { makeSchemasAccountHttpBinding } from "./BindingHttp.js";
import { GetDiscoveredSchema } from "./GetDiscoveredSchema.js";
export const GetDiscoveredSchemaHttp = Layer.effect(GetDiscoveredSchema, makeSchemasAccountHttpBinding({
    tag: "AWS.Schemas.GetDiscoveredSchema",
    operation: schemas.getDiscoveredSchema,
    actions: ["schemas:GetDiscoveredSchema"],
}));
//# sourceMappingURL=GetDiscoveredSchemaHttp.js.map