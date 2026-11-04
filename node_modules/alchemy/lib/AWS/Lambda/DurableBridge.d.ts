import * as Effect from "effect/Effect";
import type * as Serverless from "../../Serverless/index.ts";
/** Module id of AWS's Durable Execution SDK (an optional peer dependency). */
export declare const DURABLE_SDK_MODULE = "@aws/durable-execution-sdk-js";
/**
 * Raw invocation payload delivered to a `DurableConfig`-enabled function.
 * Mirrors the SDK's `DurableExecutionInvocationInput`.
 */
export interface DurableExecutionInvocationEvent {
    DurableExecutionArn: string;
    CheckpointToken: string;
    UpdatedOperationIds?: string[];
    InitialExecutionState: {
        Operations?: {
            Type?: string;
            ExecutionDetails?: {
                InputPayload?: string;
            };
        }[];
        NextMarker?: string;
    };
}
/**
 * Shape predicate for durable-execution invocations — the durable analogue of
 * `isSQSEvent`. A durable function's invocations always arrive in this
 * envelope (the durable execution wraps even the first invocation).
 */
export declare const isDurableExecutionEvent: (event: any) => event is DurableExecutionInvocationEvent;
/**
 * Lambda has a single exported handler (unlike workerd's named class
 * exports), so when several DurableFunctions share one host the start payload
 * carries a discriminator. Alchemy owns both ends — the `start` client wraps
 * the params, the listener unwraps them — so user code never sees this.
 */
export interface DurableEnvelope {
    $alchemy: {
        workflow: string;
    };
    params: unknown;
}
export declare const encodeDurableEnvelope: (workflow: string, params: unknown) => string;
/**
 * Extract the customer input payload from the checkpoint log's EXECUTION
 * operation (first page — the EXECUTION operation is always the log's first
 * entry, so pagination never hides it).
 */
export declare const readDurableInputPayload: (event: DurableExecutionInvocationEvent) => unknown;
export declare const makeDurableListener: (options: {
    name: string;
    run: (input: unknown) => Effect.Effect<unknown>;
}) => Effect.Effect<Serverless.FunctionListener>;
//# sourceMappingURL=DurableBridge.d.ts.map