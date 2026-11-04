import * as Layer from "effect/Layer";
import { makeKVNamespaceHelpers } from "./NamespaceBinding.ts";
import { WriteNamespace, type WriteNamespaceClient } from "./WriteNamespace.ts";
/**
 * Implementation of the {@link WriteNamespace} binding that uses a Worker
 * binding.
 */
export declare const WriteNamespaceBinding: Layer.Layer<WriteNamespace, never, import("../index.ts").WorkerEnvironment | import("../index.ts").Worker<any>>;
/** Build the write half of the binding client. */
export declare const makeWriteKVClient: ({ use, }: ReturnType<typeof makeKVNamespaceHelpers>) => WriteNamespaceClient;
//# sourceMappingURL=WriteNamespaceBinding.d.ts.map