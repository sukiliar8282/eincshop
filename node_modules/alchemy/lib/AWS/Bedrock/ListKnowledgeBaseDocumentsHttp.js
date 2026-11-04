import * as bedrock from "@distilled.cloud/aws/bedrock-agent";
import * as Layer from "effect/Layer";
import { makeDataSourceScopedHttpBinding } from "./BindingHttp.js";
import { ListKnowledgeBaseDocuments } from "./ListKnowledgeBaseDocuments.js";
export const ListKnowledgeBaseDocumentsHttp = Layer.effect(ListKnowledgeBaseDocuments, makeDataSourceScopedHttpBinding({
    tag: "AWS.Bedrock.ListKnowledgeBaseDocuments",
    operation: bedrock.listKnowledgeBaseDocuments,
    actions: ["bedrock:ListKnowledgeBaseDocuments"],
}));
//# sourceMappingURL=ListKnowledgeBaseDocumentsHttp.js.map