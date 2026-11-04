import * as mm from "@distilled.cloud/aws/mailmanager";
import * as Layer from "effect/Layer";
import { makeAddressListHttpBinding } from "./BindingHttp.js";
import { RegisterMemberToAddressList } from "./RegisterMemberToAddressList.js";
export const RegisterMemberToAddressListHttp = Layer.effect(RegisterMemberToAddressList, makeAddressListHttpBinding({
    tag: "AWS.MailManager.RegisterMemberToAddressList",
    operation: mm.registerMemberToAddressList,
    actions: ["ses:RegisterMemberToAddressList"],
}));
//# sourceMappingURL=RegisterMemberToAddressListHttp.js.map