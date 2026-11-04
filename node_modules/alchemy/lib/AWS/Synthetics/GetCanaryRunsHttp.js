import * as synthetics from "@distilled.cloud/aws/synthetics";
import * as Layer from "effect/Layer";
import { makeSyntheticsCanaryHttpBinding } from "./BindingHttp.js";
import { GetCanaryRuns } from "./GetCanaryRuns.js";
export const GetCanaryRunsHttp = Layer.effect(GetCanaryRuns, makeSyntheticsCanaryHttpBinding({
    tag: "AWS.Synthetics.GetCanaryRuns",
    operation: synthetics.getCanaryRuns,
    actions: ["synthetics:GetCanaryRuns"],
}));
//# sourceMappingURL=GetCanaryRunsHttp.js.map