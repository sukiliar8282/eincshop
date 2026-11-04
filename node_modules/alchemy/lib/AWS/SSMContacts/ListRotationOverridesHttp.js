import * as ssm from "@distilled.cloud/aws/ssm-contacts";
import * as Layer from "effect/Layer";
import { makeRotationHttpBinding } from "./BindingHttp.js";
import { ListRotationOverrides } from "./ListRotationOverrides.js";
export const ListRotationOverridesHttp = Layer.effect(ListRotationOverrides, makeRotationHttpBinding({
    tag: "AWS.SSMContacts.ListRotationOverrides",
    operation: ssm.listRotationOverrides,
    actions: ["ssm-contacts:ListRotationOverrides"],
}));
//# sourceMappingURL=ListRotationOverridesHttp.js.map