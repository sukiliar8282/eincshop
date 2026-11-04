import * as osis from "@distilled.cloud/aws/osis";
import * as Layer from "effect/Layer";
import { makeOsisAccountHttpBinding } from "./BindingHttp.js";
import { ValidatePipeline } from "./ValidatePipeline.js";
export const ValidatePipelineHttp = Layer.effect(ValidatePipeline, makeOsisAccountHttpBinding({
    tag: "AWS.OSIS.ValidatePipeline",
    operation: osis.validatePipeline,
    actions: ["osis:ValidatePipeline"],
}));
//# sourceMappingURL=ValidatePipelineHttp.js.map