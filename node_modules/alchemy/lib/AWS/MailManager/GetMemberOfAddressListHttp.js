import * as mm from "@distilled.cloud/aws/mailmanager";
import * as Layer from "effect/Layer";
import { makeAddressListHttpBinding } from "./BindingHttp.js";
import { GetMemberOfAddressList } from "./GetMemberOfAddressList.js";
export const GetMemberOfAddressListHttp = Layer.effect(GetMemberOfAddressList, makeAddressListHttpBinding({
    tag: "AWS.MailManager.GetMemberOfAddressList",
    operation: mm.getMemberOfAddressList,
    actions: ["ses:GetMemberOfAddressList"],
}));
//# sourceMappingURL=GetMemberOfAddressListHttp.js.map