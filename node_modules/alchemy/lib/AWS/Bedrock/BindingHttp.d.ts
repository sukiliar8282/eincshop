import * as Effect from "effect/Effect";
import type { AgentAlias } from "./AgentAlias.ts";
import type { DataSource } from "./DataSource.ts";
import type { KnowledgeBase } from "./KnowledgeBase.ts";
/**
 * Build the impl Effect for a model-scoped `bedrock-runtime` operation whose
 * request carries a top-level `modelId`. The binding accepts one or more
 * model references (foundation-model id, cross-region inference profile id,
 * or full ARN), grants `actions` on exactly the resolved model ARNs, and the
 * runtime callable defaults `modelId` to the first bound model.
 */
export declare const makeModelScopedHttpBinding: <I extends {
    modelId: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Bedrock.Converse`. */
    tag: string;
    /** The distilled operation; `modelId` defaults to the first bound model. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the bound model ARNs. */
    actions: readonly string[];
}) => Effect.Effect<(model: string, ...additionalModels: string[]) => Effect.Effect<(request: Omit<I, "modelId"> & {
    modelId?: string;
}) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a knowledge-base-scoped `bedrock-agent-runtime`
 * operation whose request carries a top-level `knowledgeBaseId`. The binding
 * grants `actions` on the bound {@link KnowledgeBase}'s ARN and the runtime
 * callable injects its `knowledgeBaseId`.
 */
export declare const makeKnowledgeBaseScopedHttpBinding: <I extends {
    knowledgeBaseId: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Bedrock.Retrieve`. */
    tag: string;
    /** The distilled operation; `knowledgeBaseId` is injected. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the knowledge-base ARN. */
    actions: readonly string[];
}) => Effect.Effect<<K extends KnowledgeBase>(knowledgeBase: K) => Effect.Effect<(request: Omit<I, "knowledgeBaseId">) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a data-source-scoped `bedrock-agent` operation
 * whose request carries top-level `knowledgeBaseId` + `dataSourceId`
 * (ingestion jobs, direct document ingestion). Bedrock authorizes these
 * actions against the parent knowledge-base ARN, so the deploy-time half
 * grants `actions` on the bound {@link DataSource}'s knowledge base; the
 * runtime callable injects both identifiers.
 */
export declare const makeDataSourceScopedHttpBinding: <I extends {
    knowledgeBaseId: string;
    dataSourceId: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Bedrock.StartIngestionJob`. */
    tag: string;
    /** The distilled operation; both identifiers are injected. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the parent knowledge-base ARN. */
    actions: readonly string[];
}) => Effect.Effect<<D extends DataSource>(dataSource: D) => Effect.Effect<(request: Omit<I, "dataSourceId" | "knowledgeBaseId">) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an agent-alias-scoped `bedrock-agent-runtime`
 * operation whose request carries top-level `agentId` + `agentAliasId`. The
 * binding grants `actions` on the bound {@link AgentAlias}'s ARN and the
 * runtime callable injects both identifiers.
 */
export declare const makeAgentAliasScopedHttpBinding: <I extends {
    agentId: string;
    agentAliasId: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Bedrock.InvokeAgent`. */
    tag: string;
    /** The distilled operation; both identifiers are injected. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the agent-alias ARN. */
    actions: readonly string[];
}) => Effect.Effect<<AA extends AgentAlias>(alias: AA) => Effect.Effect<(request: Omit<I, "agentAliasId" | "agentId">) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a managed-RAG operation (`RetrieveAndGenerate` /
 * `RetrieveAndGenerateStream`). The binding grants `bedrock:Retrieve` +
 * `bedrock:RetrieveAndGenerate` on the bound {@link KnowledgeBase} plus
 * `bedrock:InvokeModel` scoped to the named generation models (or all
 * foundation models + cross-region inference profiles when none are named).
 * The request passes through unchanged — the knowledge base is referenced
 * inside `retrieveAndGenerateConfiguration`.
 */
export declare const makeRagHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Bedrock.RetrieveAndGenerate`. */
    tag: string;
    /** The distilled operation; the request passes through unchanged. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
}) => Effect.Effect<<K extends KnowledgeBase>(knowledgeBase: K, ...models: string[]) => Effect.Effect<(request: I) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map