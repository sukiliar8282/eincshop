import * as securityhub from "@distilled.cloud/aws/securityhub";
import * as Layer from "effect/Layer";
import { makeSecurityHubHttpBinding } from "./BindingHttp.js";
import { ListStandardsControlAssociations } from "./ListStandardsControlAssociations.js";
export const ListStandardsControlAssociationsHttp = Layer.effect(ListStandardsControlAssociations, makeSecurityHubHttpBinding({
    tag: "AWS.SecurityHub.ListStandardsControlAssociations",
    operation: securityhub.listStandardsControlAssociations,
    actions: ["securityhub:ListStandardsControlAssociations"],
}));
//# sourceMappingURL=ListStandardsControlAssociationsHttp.js.map