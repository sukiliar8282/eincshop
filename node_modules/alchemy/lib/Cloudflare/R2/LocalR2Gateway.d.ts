import type * as Context from "effect/Context";
import { type makeHelpers } from "./BucketBinding.ts";
/**
 * Binding-client helpers backed by a per-operation platform proxy instead
 * of a Worker's `env`. `raw` cannot be satisfied — a native bucket only
 * lives as long as its proxy's scope — so it dies with guidance.
 */
export declare const makeProxyBucketHelpers: (bucketName: string, 
/**
 * The FULL ambient stack-eval context: platform services for booting
 * workerd plus `CloudflareEnvironment`/`AlchemyContext` for the runtime
 * layer.
 */
ambient: Context.Context<never>) => ReturnType<typeof makeHelpers>;
//# sourceMappingURL=LocalR2Gateway.d.ts.map