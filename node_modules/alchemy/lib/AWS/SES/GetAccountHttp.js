import * as sesv2 from "@distilled.cloud/aws/sesv2";
import * as Layer from "effect/Layer";
import { makeSESHttpBinding } from "./BindingHttp.js";
import { GetAccount } from "./GetAccount.js";
export const GetAccountHttp = Layer.effect(GetAccount, makeSESHttpBinding({
    tag: "AWS.SES.GetAccount",
    operation: sesv2.getAccount,
    actions: ["ses:GetAccount"],
}));
//# sourceMappingURL=GetAccountHttp.js.map