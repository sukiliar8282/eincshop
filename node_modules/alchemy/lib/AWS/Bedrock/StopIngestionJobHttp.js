import * as bedrock from "@distilled.cloud/aws/bedrock-agent";
import * as Layer from "effect/Layer";
import { makeDataSourceScopedHttpBinding } from "./BindingHttp.js";
import { StopIngestionJob } from "./StopIngestionJob.js";
export const StopIngestionJobHttp = Layer.effect(StopIngestionJob, makeDataSourceScopedHttpBinding({
    tag: "AWS.Bedrock.StopIngestionJob",
    operation: bedrock.stopIngestionJob,
    actions: ["bedrock:StopIngestionJob"],
}));
//# sourceMappingURL=StopIngestionJobHttp.js.map