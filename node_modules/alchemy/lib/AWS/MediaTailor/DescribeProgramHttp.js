import * as mediatailor from "@distilled.cloud/aws/mediatailor";
import * as Layer from "effect/Layer";
import { makeMediaTailorHttpBinding } from "./BindingHttp.js";
import { DescribeProgram } from "./DescribeProgram.js";
export const DescribeProgramHttp = Layer.effect(DescribeProgram, makeMediaTailorHttpBinding({
    capability: "DescribeProgram",
    iamActions: ["mediatailor:DescribeProgram"],
    operation: mediatailor.describeProgram,
}));
//# sourceMappingURL=DescribeProgramHttp.js.map