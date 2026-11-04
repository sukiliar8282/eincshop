import * as schemas from "@distilled.cloud/aws/schemas";
import * as Layer from "effect/Layer";
import { makeSchemasSchemaHttpBinding } from "./BindingHttp.js";
import { DescribeSchema } from "./DescribeSchema.js";
export const DescribeSchemaHttp = Layer.effect(DescribeSchema, makeSchemasSchemaHttpBinding({
    tag: "AWS.Schemas.DescribeSchema",
    operation: schemas.describeSchema,
    actions: ["schemas:DescribeSchema"],
}));
//# sourceMappingURL=DescribeSchemaHttp.js.map