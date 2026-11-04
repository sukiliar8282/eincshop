import * as securityhub from "@distilled.cloud/aws/securityhub";
import * as Layer from "effect/Layer";
import { makeSecurityHubHttpBinding } from "./BindingHttp.js";
import { EnableImportFindingsForProduct } from "./EnableImportFindingsForProduct.js";
export const EnableImportFindingsForProductHttp = Layer.effect(EnableImportFindingsForProduct, makeSecurityHubHttpBinding({
    tag: "AWS.SecurityHub.EnableImportFindingsForProduct",
    operation: securityhub.enableImportFindingsForProduct,
    actions: ["securityhub:EnableImportFindingsForProduct"],
}));
//# sourceMappingURL=EnableImportFindingsForProductHttp.js.map