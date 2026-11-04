import * as Layer from "effect/Layer";
import { Worker, WorkerEnvironment } from "../Workers/Worker.ts";
import { ReadNamespace, ReadWriteNamespace, WriteNamespace } from "./ReadWriteNamespace.ts";
/** Read-only Artifacts binding (`get`/`list`/`raw`). */
export declare const ReadNamespaceBinding: Layer.Layer<ReadNamespace, never, WorkerEnvironment | Worker>;
/** Write Artifacts binding (`create`/`delete`/`import`). */
export declare const WriteNamespaceBinding: Layer.Layer<WriteNamespace, never, WorkerEnvironment | Worker>;
/** Full read + write Artifacts binding. */
export declare const ReadWriteNamespaceBinding: Layer.Layer<ReadWriteNamespace, never, WorkerEnvironment | Worker>;
//# sourceMappingURL=ReadWriteNamespaceBinding.d.ts.map