import * as bedrock from "@distilled.cloud/aws/bedrock-agent";
import * as Layer from "effect/Layer";
import { makeDataSourceScopedHttpBinding } from "./BindingHttp.js";
import { IngestKnowledgeBaseDocuments } from "./IngestKnowledgeBaseDocuments.js";
export const IngestKnowledgeBaseDocumentsHttp = Layer.effect(IngestKnowledgeBaseDocuments, makeDataSourceScopedHttpBinding({
    tag: "AWS.Bedrock.IngestKnowledgeBaseDocuments",
    operation: bedrock.ingestKnowledgeBaseDocuments,
    actions: ["bedrock:IngestKnowledgeBaseDocuments"],
}));
//# sourceMappingURL=IngestKnowledgeBaseDocumentsHttp.js.map