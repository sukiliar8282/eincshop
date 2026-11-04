import * as shield from "@distilled.cloud/aws/shield";
import * as Layer from "effect/Layer";
import { makeShieldHttpBinding } from "./BindingHttp.js";
import { ListResourcesInProtectionGroup } from "./ListResourcesInProtectionGroup.js";
export const ListResourcesInProtectionGroupHttp = Layer.effect(ListResourcesInProtectionGroup, makeShieldHttpBinding({
    tag: "AWS.Shield.ListResourcesInProtectionGroup",
    operation: shield.listResourcesInProtectionGroup,
    actions: ["shield:ListResourcesInProtectionGroup"],
}));
//# sourceMappingURL=ListResourcesInProtectionGroupHttp.js.map