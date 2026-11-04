import * as ram from "@distilled.cloud/aws/ram";
import * as Layer from "effect/Layer";
import { makeRAMHttpBinding } from "./BindingHttp.js";
import { GetResourceShares } from "./GetResourceShares.js";
export const GetResourceSharesHttp = Layer.effect(GetResourceShares, makeRAMHttpBinding({
    capability: "GetResourceShares",
    iamActions: ["ram:GetResourceShares"],
    operation: ram.getResourceShares,
}));
//# sourceMappingURL=GetResourceSharesHttp.js.map