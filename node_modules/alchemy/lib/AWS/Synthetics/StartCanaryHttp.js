import * as synthetics from "@distilled.cloud/aws/synthetics";
import * as Layer from "effect/Layer";
import { makeSyntheticsCanaryHttpBinding } from "./BindingHttp.js";
import { StartCanary } from "./StartCanary.js";
export const StartCanaryHttp = Layer.effect(StartCanary, makeSyntheticsCanaryHttpBinding({
    tag: "AWS.Synthetics.StartCanary",
    operation: synthetics.startCanary,
    actions: ["synthetics:StartCanary"],
}));
//# sourceMappingURL=StartCanaryHttp.js.map