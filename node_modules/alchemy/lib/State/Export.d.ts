import * as Effect from "effect/Effect";
import { State, type PersistedState } from "./State.ts";
/**
 * One resource record in a state export, addressed by the
 * `(stack, stage, fqn)` triple so a flat list spans the whole estate.
 */
export interface ExportedResource {
    /** Stack the record belongs to. */
    stack: string;
    /** Stage the record belongs to. */
    stage: string;
    /** Fully-qualified resource name (namespace path + logical ID). */
    fqn: string;
    /** The persisted record — the same value `state.get` returns. */
    state: PersistedState;
}
/**
 * A bulk read of the state store: every matching resource record in a
 * single document. Shaped as a flat list so consumers can filter
 * locally (e.g. `jq '.resources[] | select(...)'`) instead of issuing
 * one read per resource.
 */
export interface StateExport {
    resources: ExportedResource[];
}
/**
 * Optional scope narrowing for {@link exportState}.
 */
export interface ExportStateFilter {
    /** Only export this stack. Omit to export every stack in the store. */
    stack?: string;
    /** Only export this stage. Omit to export every stage. */
    stage?: string;
}
/**
 * Read every resource record in scope from the state store as one
 * document.
 *
 * Fans out over every `(stack, stage)` the store holds — see
 * {@link allStages} — with the per-resource reads bounded, so a whole
 * estate is fetched in a single pass instead of a call per resource.
 * Records that disappear between `list` and `get` (a concurrent
 * deploy/destroy) are skipped rather than failing the export.
 *
 * Results are ordered deterministically: by stack, then stage, then
 * FQN.
 */
export declare const exportState: (filter?: ExportStateFilter | undefined) => Effect.Effect<{
    resources: ExportedResource[];
}, import("./State.ts").StateStoreError, State>;
//# sourceMappingURL=Export.d.ts.map