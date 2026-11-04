import * as account from "@distilled.cloud/aws/account";
import * as Layer from "effect/Layer";
import { makeAccountHttpBinding } from "./BindingHttp.js";
import { GetAlternateContact } from "./GetAlternateContact.js";
export const GetAlternateContactHttp = Layer.effect(GetAlternateContact, makeAccountHttpBinding({
    capability: "GetAlternateContact",
    iamActions: ["account:GetAlternateContact"],
    operation: account.getAlternateContact,
}));
//# sourceMappingURL=GetAlternateContactHttp.js.map