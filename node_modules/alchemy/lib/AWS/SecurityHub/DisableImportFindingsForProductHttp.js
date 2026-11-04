import * as securityhub from "@distilled.cloud/aws/securityhub";
import * as Layer from "effect/Layer";
import { makeSecurityHubHttpBinding } from "./BindingHttp.js";
import { DisableImportFindingsForProduct } from "./DisableImportFindingsForProduct.js";
export const DisableImportFindingsForProductHttp = Layer.effect(DisableImportFindingsForProduct, makeSecurityHubHttpBinding({
    tag: "AWS.SecurityHub.DisableImportFindingsForProduct",
    operation: securityhub.disableImportFindingsForProduct,
    actions: ["securityhub:DisableImportFindingsForProduct"],
}));
//# sourceMappingURL=DisableImportFindingsForProductHttp.js.map