import * as Layer from "effect/Layer";
import { Worker, WorkerEnvironment } from "../Workers/Worker.ts";
import { type LegacyPipeline } from "./LegacyPipeline.ts";
import type { Stream } from "./Stream.ts";
import { WriteStream, type WriteStreamClient } from "./WriteStream.ts";
/**
 * Implementation of the {@link WriteStream} service that uses a native
 * Worker `pipelines` binding.
 */
export declare const WriteStreamBinding: Layer.Layer<WriteStream, never, WorkerEnvironment | Worker<any>>;
/** Build the producer client over a native Worker `pipelines` binding. */
export declare const makeWriteStreamClient: (env: Record<string, any>, stream: Stream | LegacyPipeline) => WriteStreamClient;
//# sourceMappingURL=WriteStreamBinding.d.ts.map