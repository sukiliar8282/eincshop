import * as ssm from "@distilled.cloud/aws/ssm-contacts";
import * as Layer from "effect/Layer";
import { makeAccountHttpBinding } from "./BindingHttp.js";
import { ListEngagements } from "./ListEngagements.js";
export const ListEngagementsHttp = Layer.effect(ListEngagements, makeAccountHttpBinding({
    tag: "AWS.SSMContacts.ListEngagements",
    operation: ssm.listEngagements,
    actions: ["ssm-contacts:ListEngagements"],
}));
//# sourceMappingURL=ListEngagementsHttp.js.map