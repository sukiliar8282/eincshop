import * as bedrock from "@distilled.cloud/aws/bedrock-agent";
import * as Layer from "effect/Layer";
import { makeDataSourceScopedHttpBinding } from "./BindingHttp.js";
import { StartIngestionJob } from "./StartIngestionJob.js";
export const StartIngestionJobHttp = Layer.effect(StartIngestionJob, makeDataSourceScopedHttpBinding({
    tag: "AWS.Bedrock.StartIngestionJob",
    operation: bedrock.startIngestionJob,
    actions: ["bedrock:StartIngestionJob"],
}));
//# sourceMappingURL=StartIngestionJobHttp.js.map