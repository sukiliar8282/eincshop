import * as ram from "@distilled.cloud/aws/ram";
import * as Layer from "effect/Layer";
import { makeRAMHttpBinding } from "./BindingHttp.js";
import { GetResourceShareAssociations } from "./GetResourceShareAssociations.js";
export const GetResourceShareAssociationsHttp = Layer.effect(GetResourceShareAssociations, makeRAMHttpBinding({
    capability: "GetResourceShareAssociations",
    iamActions: ["ram:GetResourceShareAssociations"],
    operation: ram.getResourceShareAssociations,
}));
//# sourceMappingURL=GetResourceShareAssociationsHttp.js.map