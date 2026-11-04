import * as fms from "@distilled.cloud/aws/fms";
import * as Layer from "effect/Layer";
import { makeFmsHttpBinding } from "./BindingHttp.js";
import { ListMemberAccounts } from "./ListMemberAccounts.js";
export const ListMemberAccountsHttp = Layer.effect(ListMemberAccounts, makeFmsHttpBinding({
    capability: "ListMemberAccounts",
    iamActions: ["fms:ListMemberAccounts"],
    operation: fms.listMemberAccounts,
}));
//# sourceMappingURL=ListMemberAccountsHttp.js.map