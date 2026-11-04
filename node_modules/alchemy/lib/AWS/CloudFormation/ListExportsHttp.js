import * as cloudformation from "@distilled.cloud/aws/cloudformation";
import * as Layer from "effect/Layer";
import { makeCloudFormationAccountHttpBinding } from "./BindingHttp.js";
import { ListExports } from "./ListExports.js";
export const ListExportsHttp = Layer.effect(ListExports, makeCloudFormationAccountHttpBinding({
    tag: "AWS.CloudFormation.ListExports",
    operation: cloudformation.listExports,
    actions: ["cloudformation:ListExports"],
}));
//# sourceMappingURL=ListExportsHttp.js.map