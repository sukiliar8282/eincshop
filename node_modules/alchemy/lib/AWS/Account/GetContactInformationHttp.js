import * as account from "@distilled.cloud/aws/account";
import * as Layer from "effect/Layer";
import { makeAccountHttpBinding } from "./BindingHttp.js";
import { GetContactInformation } from "./GetContactInformation.js";
export const GetContactInformationHttp = Layer.effect(GetContactInformation, makeAccountHttpBinding({
    capability: "GetContactInformation",
    iamActions: ["account:GetContactInformation"],
    operation: account.getContactInformation,
}));
//# sourceMappingURL=GetContactInformationHttp.js.map