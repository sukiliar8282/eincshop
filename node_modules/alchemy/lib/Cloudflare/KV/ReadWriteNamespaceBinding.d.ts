import * as Layer from "effect/Layer";
import { type makeKVNamespaceHelpers } from "./NamespaceBinding.ts";
import { ReadWriteNamespace, type ReadWriteNamespaceClient } from "./ReadWriteNamespace.ts";
/**
 * Implementation of the {@link ReadWriteNamespace} binding that uses a
 * Worker binding.
 */
export declare const ReadWriteNamespaceBinding: Layer.Layer<ReadWriteNamespace, never, import("../index.ts").WorkerEnvironment | import("../index.ts").Worker<any>>;
/** Build the read-write binding client from its read and write halves. */
export declare const makeReadWriteKVClient: (helpers: ReturnType<typeof makeKVNamespaceHelpers>) => ReadWriteNamespaceClient;
//# sourceMappingURL=ReadWriteNamespaceBinding.d.ts.map