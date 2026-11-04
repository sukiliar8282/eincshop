import * as synthetics from "@distilled.cloud/aws/synthetics";
import * as Layer from "effect/Layer";
import { makeSyntheticsCanaryHttpBinding } from "./BindingHttp.js";
import { StopCanary } from "./StopCanary.js";
export const StopCanaryHttp = Layer.effect(StopCanary, makeSyntheticsCanaryHttpBinding({
    tag: "AWS.Synthetics.StopCanary",
    operation: synthetics.stopCanary,
    actions: ["synthetics:StopCanary"],
}));
//# sourceMappingURL=StopCanaryHttp.js.map