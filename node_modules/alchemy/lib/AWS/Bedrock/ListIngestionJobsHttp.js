import * as bedrock from "@distilled.cloud/aws/bedrock-agent";
import * as Layer from "effect/Layer";
import { makeDataSourceScopedHttpBinding } from "./BindingHttp.js";
import { ListIngestionJobs } from "./ListIngestionJobs.js";
export const ListIngestionJobsHttp = Layer.effect(ListIngestionJobs, makeDataSourceScopedHttpBinding({
    tag: "AWS.Bedrock.ListIngestionJobs",
    operation: bedrock.listIngestionJobs,
    actions: ["bedrock:ListIngestionJobs"],
}));
//# sourceMappingURL=ListIngestionJobsHttp.js.map