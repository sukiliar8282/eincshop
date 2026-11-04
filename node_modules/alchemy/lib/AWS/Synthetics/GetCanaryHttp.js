import * as synthetics from "@distilled.cloud/aws/synthetics";
import * as Layer from "effect/Layer";
import { makeSyntheticsCanaryHttpBinding } from "./BindingHttp.js";
import { GetCanary } from "./GetCanary.js";
export const GetCanaryHttp = Layer.effect(GetCanary, makeSyntheticsCanaryHttpBinding({
    tag: "AWS.Synthetics.GetCanary",
    operation: synthetics.getCanary,
    actions: ["synthetics:GetCanary"],
}));
//# sourceMappingURL=GetCanaryHttp.js.map