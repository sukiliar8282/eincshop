import * as mediaconnect from "@distilled.cloud/aws/mediaconnect";
import * as Layer from "effect/Layer";
import { makeMediaConnectAccountHttpBinding } from "./BindingHttp.js";
import { ListEntitlements } from "./ListEntitlements.js";
export const ListEntitlementsHttp = Layer.effect(ListEntitlements, makeMediaConnectAccountHttpBinding({
    tag: "AWS.MediaConnect.ListEntitlements",
    operation: mediaconnect.listEntitlements,
    actions: ["mediaconnect:ListEntitlements"],
}));
//# sourceMappingURL=ListEntitlementsHttp.js.map