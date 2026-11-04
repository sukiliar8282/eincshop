import * as securityhub from "@distilled.cloud/aws/securityhub";
import * as Layer from "effect/Layer";
import { makeSecurityHubHttpBinding } from "./BindingHttp.js";
import { GetSecurityControlDefinition } from "./GetSecurityControlDefinition.js";
export const GetSecurityControlDefinitionHttp = Layer.effect(GetSecurityControlDefinition, makeSecurityHubHttpBinding({
    tag: "AWS.SecurityHub.GetSecurityControlDefinition",
    operation: securityhub.getSecurityControlDefinition,
    actions: ["securityhub:GetSecurityControlDefinition"],
}));
//# sourceMappingURL=GetSecurityControlDefinitionHttp.js.map