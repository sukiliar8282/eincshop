import * as cloudformation from "@distilled.cloud/aws/cloudformation";
import * as Layer from "effect/Layer";
import { makeCloudFormationAccountHttpBinding } from "./BindingHttp.js";
import { ListImports } from "./ListImports.js";
export const ListImportsHttp = Layer.effect(ListImports, makeCloudFormationAccountHttpBinding({
    tag: "AWS.CloudFormation.ListImports",
    operation: cloudformation.listImports,
    actions: ["cloudformation:ListImports"],
}));
//# sourceMappingURL=ListImportsHttp.js.map