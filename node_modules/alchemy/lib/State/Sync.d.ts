import * as Effect from "effect/Effect";
import { type StateService } from "./State.ts";
/**
 * Synchronize all state (every stack/stage/resource) from `source` into
 * `destination` so that `destination` becomes a mirror of `source`.
 *
 * For each `{ stack, stage, fqn }` present in `source`, the resource is
 * written into `destination`, overwriting any existing entry under the same
 * key. Any keys present in `destination` but absent from `source` are
 * deleted, ensuring the two stores end up structurally identical.
 *
 * Stacks are walked sequentially; stages within a stack and resources
 * within a stage are processed concurrently for throughput.
 */
export declare const syncState: (source: StateService, destination: StateService, options?: {
    stacks?: string[];
    /**
     * Maximum number of resources to copy in parallel within a single stage.
     * @default "unbounded".
     */
    concurrency?: number | "unbounded";
} | undefined) => Effect.Effect<void, import("./State.ts").StateStoreError, never>;
//# sourceMappingURL=Sync.d.ts.map