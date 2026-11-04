import * as aiGateway from "@distilled.cloud/cloudflare/ai-gateway";
import * as Effect from "effect/Effect";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.AI.Evaluation";
type TypeId = typeof TypeId;
export type EvaluationProps = {
    /**
     * The AI Gateway the evaluation runs against. Changing the gateway
     * triggers a replacement.
     */
    gatewayId: string;
    /**
     * Human readable evaluation name. If omitted, a unique name is generated
     * from the app, stage, and logical ID. Evaluations are immutable —
     * changing the name triggers a replacement.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * The datasets (saved log filters) the evaluation processes. Usually the
     * `datasetId` attributes of `Dataset` resources on the same
     * gateway. Changing the datasets triggers a replacement.
     */
    datasetIds: string[];
    /**
     * The evaluation types to run (e.g. speed, cost). Discover ids with
     * `listEvaluationTypes` — the mandatory `speed` and `cost` types are
     * account-global constants. Changing the types triggers a replacement.
     */
    evaluationTypeIds: string[];
};
export type EvaluationAttributes = {
    /**
     * Server-generated evaluation identifier. Stable for the lifetime of the
     * evaluation.
     */
    evaluationId: string;
    /**
     * The Cloudflare account the evaluation belongs to.
     */
    accountId: string;
    /**
     * The AI Gateway the evaluation runs against.
     */
    gatewayId: string;
    /**
     * Human readable evaluation name.
     */
    name: string;
    /**
     * The dataset ids the evaluation processes.
     */
    datasetIds: string[];
    /**
     * The evaluation type ids the evaluation runs.
     */
    evaluationTypeIds: string[];
    /**
     * Whether Cloudflare has finished processing the evaluation. Evaluations
     * are asynchronous jobs over logged traffic — this starts `false`.
     */
    processed: boolean;
    /**
     * Number of logs the evaluation covers.
     */
    totalLogs: number;
    /**
     * When the evaluation was created.
     */
    createdAt: string;
    /**
     * When the evaluation was last modified.
     */
    modifiedAt: string;
};
export type Evaluation = Resource<TypeId, EvaluationProps, EvaluationAttributes, never, Providers>;
/**
 * An evaluation job on a Cloudflare.AI. Gateway.
 *
 * Evaluations measure performance (speed, cost, feedback) of the logged
 * traffic captured by one or more datasets on a gateway. They are
 * create-only on Cloudflare's side: any prop change replaces the
 * evaluation with a fresh job.
 * ### Creating an Evaluation
 * **Example:** Evaluate a dataset for speed and cost
 * ```typescript
 * const gateway = yield* Cloudflare.AI.Gateway("Gateway");
 *
 * const dataset = yield* Cloudflare.AI.Dataset("SuccessLogs", {
 *   gatewayId: gateway.gatewayId,
 *   filters: [{ key: "success", operator: "eq", value: [true] }],
 * });
 *
 * const types = yield* listEvaluationTypes(gateway.accountId);
 * const evaluation = yield* Cloudflare.AI.Evaluation("Baseline", {
 *   gatewayId: gateway.gatewayId,
 *   datasetIds: [dataset.datasetId],
 *   evaluationTypeIds: types
 *     .filter((t) => t.mandatory)
 *     .map((t) => t.id),
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/ai-gateway/evaluations/
 *
 * @resource
 * @product AI Gateway
 * @category AI
 */
export declare const Evaluation: import("../../Resource.ts").ResourceClass<Evaluation>;
/**
 * Returns true if the given value is an Evaluation resource.
 */
export declare const isEvaluation: (value: unknown) => value is Evaluation;
/**
 * List the evaluation types available on the account (speed, cost,
 * feedback, ...). The `mandatory` types must be included in every
 * evaluation.
 */
export declare const listEvaluationTypes: (accountId: string) => Effect.Effect<aiGateway.EvaluationTypesListResultList, aiGateway.CloudflareOpError, aiGateway.CloudflareOpContext>;
export declare const EvaluationProvider: () => import("effect/Layer").Layer<Provider.Provider<Evaluation>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | aiGateway.CloudflareOpContext>;
export {};
//# sourceMappingURL=Evaluation.d.ts.map