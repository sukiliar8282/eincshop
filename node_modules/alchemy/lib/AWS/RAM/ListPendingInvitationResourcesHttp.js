import * as ram from "@distilled.cloud/aws/ram";
import * as Layer from "effect/Layer";
import { makeRAMHttpBinding } from "./BindingHttp.js";
import { ListPendingInvitationResources } from "./ListPendingInvitationResources.js";
export const ListPendingInvitationResourcesHttp = Layer.effect(ListPendingInvitationResources, makeRAMHttpBinding({
    capability: "ListPendingInvitationResources",
    iamActions: ["ram:ListPendingInvitationResources"],
    operation: ram.listPendingInvitationResources,
}));
//# sourceMappingURL=ListPendingInvitationResourcesHttp.js.map