import * as Effect from "effect/Effect";
import { diffTags, type Tags } from "../Tags.ts";
/**
 * Hetzner label keys cannot contain `:`. Alchemy ownership tags use
 * `alchemy::stack` / `alchemy::stage` / `alchemy::id` — map those onto
 * `alchemy.stack` / `alchemy.stage` / `alchemy.id` so they survive the
 * Cloud API, and invert the mapping when reading observed labels back.
 *
 * Label values must match `^[A-Za-z0-9]([A-Za-z0-9._-]{0,61}[A-Za-z0-9])?$`
 * (or be empty). FQNs that contain `/` are rewritten to `__`.
 */
export declare const ALCHEMY_LABEL_PREFIX = "alchemy.";
export declare const alchemyLabelKeys: {
    readonly stack: "alchemy.stack";
    readonly stage: "alchemy.stage";
    readonly id: "alchemy.id";
};
/**
 * Hetzner `label_selector` matching any resource Alchemy stamped with
 * `alchemy.stack`. Used by `list` so nuke only enumerates our rows.
 */
export declare const alchemyStackSelector: "alchemy.stack";
export declare const toLabelKey: (tagKey: string) => string;
export declare const toTagKey: (labelKey: string) => string;
export declare const sanitizeLabelValue: (value: string) => string;
export declare const toLabels: (tags: Record<string, string> | null | undefined) => Record<string, string>;
export declare const fromLabels: (labels: Record<string, string> | null | undefined) => Record<string, string>;
export declare const createInternalLabels: (id: string) => Effect.Effect<Record<string, string>, never, import("../Stack.ts").Stack | import("../Stage.ts").Stage>;
export declare const stripInternalLabels: (labels: Record<string, string> | null | undefined) => Record<string, string>;
export declare const hasAlchemyLabels: (id: string, labels: Tags | undefined) => Effect.Effect<boolean, never, import("../Stack.ts").Stack | import("../Stage.ts").Stage>;
/**
 * Diff observed cloud labels against desired labels. Always pass
 * **observed** labels as `oldLabels` — never `olds.labels` or
 * `output.labels` — so adoption converges.
 */
export declare const diffLabels: typeof diffTags;
/**
 * Hetzner label-selector string for a label map (`key=value,key=value`).
 */
export declare const labelSelector: (labels: Record<string, string>) => string;
//# sourceMappingURL=Labels.d.ts.map