import * as ssm from "@distilled.cloud/aws/ssm-contacts";
import * as Layer from "effect/Layer";
import { makeContactHttpBinding } from "./BindingHttp.js";
import { ListPagesByContact } from "./ListPagesByContact.js";
export const ListPagesByContactHttp = Layer.effect(ListPagesByContact, makeContactHttpBinding({
    tag: "AWS.SSMContacts.ListPagesByContact",
    operation: ssm.listPagesByContact,
    actions: ["ssm-contacts:ListPagesByContact"],
}));
//# sourceMappingURL=ListPagesByContactHttp.js.map