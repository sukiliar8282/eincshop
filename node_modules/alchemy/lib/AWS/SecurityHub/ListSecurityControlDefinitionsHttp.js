import * as securityhub from "@distilled.cloud/aws/securityhub";
import * as Layer from "effect/Layer";
import { makeSecurityHubHttpBinding } from "./BindingHttp.js";
import { ListSecurityControlDefinitions } from "./ListSecurityControlDefinitions.js";
export const ListSecurityControlDefinitionsHttp = Layer.effect(ListSecurityControlDefinitions, makeSecurityHubHttpBinding({
    tag: "AWS.SecurityHub.ListSecurityControlDefinitions",
    operation: securityhub.listSecurityControlDefinitions,
    actions: ["securityhub:ListSecurityControlDefinitions"],
}));
//# sourceMappingURL=ListSecurityControlDefinitionsHttp.js.map