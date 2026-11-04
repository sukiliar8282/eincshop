import * as Effect from "effect/Effect";
import type * as Serverless from "../../Serverless/index.ts";
export interface WorkerRuntimeContext extends Serverless.FunctionContext {
    export(name: string, value: any): Effect.Effect<void>;
    shape: () => Record<string, any>;
}
export declare const makeWorkerRuntimeContext: (id: string) => WorkerRuntimeContext;
//# sourceMappingURL=WorkerRuntimeContext.d.ts.map