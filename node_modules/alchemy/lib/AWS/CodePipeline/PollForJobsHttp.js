import * as codepipeline from "@distilled.cloud/aws/codepipeline";
import * as Layer from "effect/Layer";
import { makeCodePipelineJobHttpBinding } from "./BindingHttp.js";
import { PollForJobs } from "./PollForJobs.js";
export const PollForJobsHttp = Layer.effect(PollForJobs, makeCodePipelineJobHttpBinding({
    tag: "AWS.CodePipeline.PollForJobs",
    operation: codepipeline.pollForJobs,
    actions: ["codepipeline:PollForJobs"],
}));
//# sourceMappingURL=PollForJobsHttp.js.map