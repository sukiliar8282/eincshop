import * as Layer from "effect/Layer";
import { makeKVNamespaceHelpers } from "./NamespaceBinding.ts";
import { ReadNamespace, type ReadNamespaceClient } from "./ReadNamespace.ts";
/**
 * Implementation of the {@link ReadNamespace} binding that uses a Worker
 * binding.
 */
export declare const ReadNamespaceBinding: Layer.Layer<ReadNamespace, never, import("../index.ts").WorkerEnvironment | import("../index.ts").Worker<any>>;
/** Build the read half of the binding client. */
export declare const makeReadKVClient: ({ raw, use, }: ReturnType<typeof makeKVNamespaceHelpers>) => ReadNamespaceClient;
//# sourceMappingURL=ReadNamespaceBinding.d.ts.map