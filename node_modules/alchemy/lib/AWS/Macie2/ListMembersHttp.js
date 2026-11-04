import * as macie2 from "@distilled.cloud/aws/macie2";
import * as Layer from "effect/Layer";
import { makeMacie2HttpBinding } from "./BindingHttp.js";
import { ListMembers } from "./ListMembers.js";
export const ListMembersHttp = Layer.effect(ListMembers, makeMacie2HttpBinding({
    tag: "AWS.Macie2.ListMembers",
    operation: macie2.listMembers,
    actions: ["macie2:ListMembers"],
}));
//# sourceMappingURL=ListMembersHttp.js.map