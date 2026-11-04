import * as mm from "@distilled.cloud/aws/mailmanager";
import * as Layer from "effect/Layer";
import { makeAddressListHttpBinding } from "./BindingHttp.js";
import { ListMembersOfAddressList } from "./ListMembersOfAddressList.js";
export const ListMembersOfAddressListHttp = Layer.effect(ListMembersOfAddressList, makeAddressListHttpBinding({
    tag: "AWS.MailManager.ListMembersOfAddressList",
    operation: mm.listMembersOfAddressList,
    actions: ["ses:ListMembersOfAddressList"],
}));
//# sourceMappingURL=ListMembersOfAddressListHttp.js.map