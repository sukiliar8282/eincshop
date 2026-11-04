import * as aiGateway from "@distilled.cloud/cloudflare/ai-gateway";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.AI.Dataset";
type TypeId = typeof TypeId;
/**
 * Log property a dataset filter can match on.
 */
export type DatasetFilterKey = "created_at" | "request_content_type" | "response_content_type" | "success" | "cached" | "provider" | "model" | "cost" | "tokens" | "tokens_in" | "tokens_out" | "duration" | "feedback";
/**
 * Comparison operator applied to a dataset filter.
 */
export type DatasetFilterOperator = "eq" | "contains" | "lt" | "gt";
/**
 * A single saved log filter on an AI Gateway dataset.
 */
export type DatasetFilter = {
    /**
     * Log property to match on (e.g. `success`, `model`, `provider`).
     */
    key: DatasetFilterKey;
    /**
     * Comparison operator.
     */
    operator: DatasetFilterOperator;
    /**
     * Values to compare against. Multiple values act as an OR.
     */
    value: (string | number | boolean)[];
};
export type DatasetProps = {
    /**
     * The AI Gateway the dataset belongs to. Changing the gateway triggers a
     * replacement.
     */
    gatewayId: string;
    /**
     * Human readable dataset name. If omitted, a unique name is generated from
     * the app, stage, and logical ID.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * Whether the dataset is enabled (actively collecting matching logs).
     * @default true
     */
    enable?: boolean;
    /**
     * Saved log filters defining which gateway logs the dataset captures.
     * An empty array captures all logs.
     */
    filters: DatasetFilter[];
};
export type DatasetAttributes = {
    /**
     * Server-generated dataset identifier. Stable across updates.
     */
    datasetId: string;
    /**
     * The Cloudflare account the dataset belongs to.
     */
    accountId: string;
    /**
     * The AI Gateway the dataset belongs to.
     */
    gatewayId: string;
    /**
     * Human readable dataset name.
     */
    name: string;
    /**
     * Whether the dataset is enabled.
     */
    enable: boolean;
    /**
     * Saved log filters.
     */
    filters: DatasetFilter[];
    /**
     * When the dataset was created.
     */
    createdAt: string;
    /**
     * When the dataset was last modified.
     */
    modifiedAt: string;
};
export type Dataset = Resource<TypeId, DatasetProps, DatasetAttributes, never, Providers>;
/**
 * A saved log filter ("dataset") on a Cloudflare.AI. Gateway.
 *
 * Datasets capture a slice of the gateway's request logs (filtered by
 * provider, model, success, cost, tokens, etc.) and serve as the input to AI
 * Gateway evaluations. Name, enablement, and filters are all mutable in
 * place; only moving the dataset to a different gateway forces a replacement.
 * ### Creating a Dataset
 * **Example:** Capture successful requests
 * ```typescript
 * const gateway = yield* Cloudflare.AI.Gateway("Gateway");
 *
 * const dataset = yield* Cloudflare.AI.Dataset("SuccessLogs", {
 *   gatewayId: gateway.gatewayId,
 *   filters: [{ key: "success", operator: "eq", value: [true] }],
 * });
 * ```
 *
 * **Example:** Capture logs for a specific model
 * ```typescript
 * const dataset = yield* Cloudflare.AI.Dataset("LlamaLogs", {
 *   gatewayId: gateway.gatewayId,
 *   name: "llama-traffic",
 *   filters: [
 *     { key: "provider", operator: "eq", value: ["workers-ai"] },
 *     { key: "model", operator: "contains", value: ["llama"] },
 *   ],
 * });
 * ```
 *
 * ### Updating a Dataset
 * **Example:** Disable collection without deleting
 * ```typescript
 * const dataset = yield* Cloudflare.AI.Dataset("SuccessLogs", {
 *   gatewayId: gateway.gatewayId,
 *   enable: false,
 *   filters: [{ key: "success", operator: "eq", value: [true] }],
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/ai-gateway/evaluations/set-up-evaluations/
 *
 * @resource
 * @product AI Gateway
 * @category AI
 */
export declare const Dataset: import("../../Resource.ts").ResourceClass<Dataset>;
/**
 * Returns true if the given value is a Dataset resource.
 */
export declare const isDataset: (value: unknown) => value is Dataset;
export declare const DatasetProvider: () => import("effect/Layer").Layer<Provider.Provider<Dataset>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | aiGateway.CloudflareOpContext>;
export {};
//# sourceMappingURL=Dataset.d.ts.map