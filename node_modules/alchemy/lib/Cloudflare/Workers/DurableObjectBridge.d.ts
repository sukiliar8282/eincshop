import type { DurableObject as DurableObjectClass } from "cloudflare:workers";
import * as Effect from "effect/Effect";
/**
 * Create a DurableObjectBridge class that proxies RPC method calls through
 * the Effect runtime, encoding success/fail/stream results as RPC envelopes.
 *
 * Accepts the `DurableObject` base class and a `getExport` resolver so the
 * implementation lives in real TypeScript instead of a generated string template.
 */
export declare const makeDurableObjectBridge: (DurableObject: typeof DurableObjectClass, { entrypoint, stack, }: {
    entrypoint: Effect.Effect<Record<string, any>>;
    stack: {
        name: string;
        stage: string;
    };
}) => (className: string) => any;
//# sourceMappingURL=DurableObjectBridge.d.ts.map