import * as macie2 from "@distilled.cloud/aws/macie2";
import * as Layer from "effect/Layer";
import { makeMacie2HttpBinding } from "./BindingHttp.js";
import { GetInvitationsCount } from "./GetInvitationsCount.js";
export const GetInvitationsCountHttp = Layer.effect(GetInvitationsCount, makeMacie2HttpBinding({
    tag: "AWS.Macie2.GetInvitationsCount",
    operation: macie2.getInvitationsCount,
    actions: ["macie2:GetInvitationsCount"],
}));
//# sourceMappingURL=GetInvitationsCountHttp.js.map