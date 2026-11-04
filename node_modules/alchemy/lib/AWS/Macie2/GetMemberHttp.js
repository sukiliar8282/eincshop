import * as macie2 from "@distilled.cloud/aws/macie2";
import * as Layer from "effect/Layer";
import { makeMacie2HttpBinding } from "./BindingHttp.js";
import { GetMember } from "./GetMember.js";
export const GetMemberHttp = Layer.effect(GetMember, makeMacie2HttpBinding({
    tag: "AWS.Macie2.GetMember",
    operation: macie2.getMember,
    actions: ["macie2:GetMember"],
}));
//# sourceMappingURL=GetMemberHttp.js.map