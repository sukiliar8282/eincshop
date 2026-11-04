import * as account from "@distilled.cloud/aws/account";
import * as Layer from "effect/Layer";
import { makeAccountHttpBinding } from "./BindingHttp.js";
import { GetAccountInformation } from "./GetAccountInformation.js";
export const GetAccountInformationHttp = Layer.effect(GetAccountInformation, makeAccountHttpBinding({
    capability: "GetAccountInformation",
    iamActions: ["account:GetAccountInformation"],
    operation: account.getAccountInformation,
}));
//# sourceMappingURL=GetAccountInformationHttp.js.map