import * as finspace from "@distilled.cloud/aws/finspace";
import * as Layer from "effect/Layer";
import { makeFinSpaceKxHttpBinding } from "./BindingHttp.js";
import { GetKxScalingGroup } from "./GetKxScalingGroup.js";
export const GetKxScalingGroupHttp = Layer.effect(GetKxScalingGroup, makeFinSpaceKxHttpBinding({
    tag: "AWS.FinSpace.GetKxScalingGroup",
    operation: finspace.getKxScalingGroup,
    actions: ["finspace:GetKxScalingGroup"],
}));
//# sourceMappingURL=GetKxScalingGroupHttp.js.map