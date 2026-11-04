import * as codepipeline from "@distilled.cloud/aws/codepipeline";
import * as Layer from "effect/Layer";
import { makeCodePipelineJobHttpBinding } from "./BindingHttp.js";
import { PutJobFailureResult } from "./PutJobFailureResult.js";
export const PutJobFailureResultHttp = Layer.effect(PutJobFailureResult, makeCodePipelineJobHttpBinding({
    tag: "AWS.CodePipeline.PutJobFailureResult",
    operation: codepipeline.putJobFailureResult,
    actions: ["codepipeline:PutJobFailureResult"],
}));
//# sourceMappingURL=PutJobFailureResultHttp.js.map