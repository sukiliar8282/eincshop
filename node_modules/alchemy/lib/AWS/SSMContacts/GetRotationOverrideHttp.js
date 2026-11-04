import * as ssm from "@distilled.cloud/aws/ssm-contacts";
import * as Layer from "effect/Layer";
import { makeRotationHttpBinding } from "./BindingHttp.js";
import { GetRotationOverride } from "./GetRotationOverride.js";
export const GetRotationOverrideHttp = Layer.effect(GetRotationOverride, makeRotationHttpBinding({
    tag: "AWS.SSMContacts.GetRotationOverride",
    operation: ssm.getRotationOverride,
    actions: ["ssm-contacts:GetRotationOverride"],
}));
//# sourceMappingURL=GetRotationOverrideHttp.js.map