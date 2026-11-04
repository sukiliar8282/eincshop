import * as securityhub from "@distilled.cloud/aws/securityhub";
import * as Layer from "effect/Layer";
import { makeSecurityHubHttpBinding } from "./BindingHttp.js";
import { ListEnabledProductsForImport } from "./ListEnabledProductsForImport.js";
export const ListEnabledProductsForImportHttp = Layer.effect(ListEnabledProductsForImport, makeSecurityHubHttpBinding({
    tag: "AWS.SecurityHub.ListEnabledProductsForImport",
    operation: securityhub.listEnabledProductsForImport,
    actions: ["securityhub:ListEnabledProductsForImport"],
}));
//# sourceMappingURL=ListEnabledProductsForImportHttp.js.map