import type { DurableObject, WorkerEntrypoint } from "cloudflare:workers";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Layer from "effect/Layer";
import * as Scope from "effect/Scope";
/**
 * The isolate-lifetime artifacts produced by a single layer build: the built
 * service Context, the resolved export for this entrypoint, the user's
 * RPC shape (a thunk — the shape is only populated once `serve` has run),
 * and the telemetry Layer override registered during init (a thunk for the
 * same reason).
 */
export interface WorkerBuild<Export = any> {
    readonly context: Context.Context<any>;
    readonly export: Export;
    readonly shape: () => Record<string, any>;
    readonly telemetry: () => Layer.Layer<never, any, any> | undefined;
}
/**
 * Makes the WorkerEntrypoint class and bridges to Effect fetch and RPC calls.
 */
export declare const makeWorkerBridge: (Base: typeof WorkerEntrypoint | typeof DurableObject, { stack, entrypoint, }: {
    stack: {
        name: string;
        stage: string;
    };
    entrypoint: any;
}) => {
    new (ctx: any, env: any): {
        readonly ctx: any;
        readonly env: any;
    };
};
export declare const getWorkerExport: <Export = any>({ entrypoint, stack, exportName, }: {
    entrypoint: any;
    stack: {
        name: string;
        stage: string;
    };
    exportName: string;
}) => {
    build: (pin: (promise: Promise<unknown>) => unknown) => Promise<WorkerBuild<Export>>;
};
export declare const makeRpcProxy: (self: any, userShape: Effect.Effect<any>, processEvent: (eff: Effect.Effect<[Effect.Effect<any>, Context.Context<never>]>) => Promise<any>) => any;
export declare const handleRpcExit: (exit: Exit.Exit<any, any>, scope?: Scope.Closeable) => Promise<any>;
//# sourceMappingURL=WorkerBridge.d.ts.map