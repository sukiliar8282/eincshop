import * as bedrock from "@distilled.cloud/aws/bedrock-agent";
import * as Layer from "effect/Layer";
import { makeDataSourceScopedHttpBinding } from "./BindingHttp.js";
import { GetIngestionJob } from "./GetIngestionJob.js";
export const GetIngestionJobHttp = Layer.effect(GetIngestionJob, makeDataSourceScopedHttpBinding({
    tag: "AWS.Bedrock.GetIngestionJob",
    operation: bedrock.getIngestionJob,
    actions: ["bedrock:GetIngestionJob"],
}));
//# sourceMappingURL=GetIngestionJobHttp.js.map