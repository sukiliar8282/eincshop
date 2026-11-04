import type * as Context from "effect/Context";
import type { makeKVNamespaceHelpers } from "./NamespaceBinding.ts";
/**
 * Binding-client helpers backed by a per-operation platform proxy instead
 * of a Worker's `env`. `raw` cannot be satisfied — a native namespace only
 * lives as long as its proxy's scope — so it dies with guidance.
 */
export declare const makeProxyKVNamespaceHelpers: (namespaceId: string, 
/**
 * The FULL ambient stack-eval context: platform services for booting
 * workerd plus `CloudflareEnvironment`/`AlchemyContext` for the runtime
 * layer.
 */
ambient: Context.Context<never>) => ReturnType<typeof makeKVNamespaceHelpers>;
//# sourceMappingURL=LocalKVGateway.d.ts.map