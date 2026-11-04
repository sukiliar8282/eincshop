import * as Effect from "effect/Effect";
import { createInternalTags, diffTags, hasTags } from "../Tags.js";
/**
 * Hetzner label keys cannot contain `:`. Alchemy ownership tags use
 * `alchemy::stack` / `alchemy::stage` / `alchemy::id` — map those onto
 * `alchemy.stack` / `alchemy.stage` / `alchemy.id` so they survive the
 * Cloud API, and invert the mapping when reading observed labels back.
 *
 * Label values must match `^[A-Za-z0-9]([A-Za-z0-9._-]{0,61}[A-Za-z0-9])?$`
 * (or be empty). FQNs that contain `/` are rewritten to `__`.
 */
export const ALCHEMY_LABEL_PREFIX = "alchemy.";
export const alchemyLabelKeys = {
    stack: "alchemy.stack",
    stage: "alchemy.stage",
    id: "alchemy.id",
};
/**
 * Hetzner `label_selector` matching any resource Alchemy stamped with
 * `alchemy.stack`. Used by `list` so nuke only enumerates our rows.
 */
export const alchemyStackSelector = alchemyLabelKeys.stack;
const TAG_PREFIX = "alchemy::";
export const toLabelKey = (tagKey) => tagKey.startsWith(TAG_PREFIX)
    ? `${ALCHEMY_LABEL_PREFIX}${tagKey.slice(TAG_PREFIX.length)}`
    : tagKey;
export const toTagKey = (labelKey) => labelKey.startsWith(ALCHEMY_LABEL_PREFIX)
    ? `${TAG_PREFIX}${labelKey.slice(ALCHEMY_LABEL_PREFIX.length)}`
    : labelKey;
export const sanitizeLabelValue = (value) => {
    const cleaned = value
        .replaceAll("/", "__")
        .replace(/[^A-Za-z0-9._-]/g, "-")
        .replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, "")
        .slice(0, 63)
        .replace(/[^A-Za-z0-9]+$/g, "");
    return cleaned.length > 0 ? cleaned : "x";
};
export const toLabels = (tags) => Object.fromEntries(Object.entries(tags ?? {}).map(([key, value]) => [
    toLabelKey(key),
    sanitizeLabelValue(value),
]));
export const fromLabels = (labels) => Object.fromEntries(Object.entries(labels ?? {}).map(([key, value]) => [toTagKey(key), value]));
export const createInternalLabels = Effect.fn(function* (id) {
    return toLabels(yield* createInternalTags(id));
});
export const stripInternalLabels = (labels) => Object.fromEntries(Object.entries(labels ?? {}).filter(([key]) => !key.startsWith(ALCHEMY_LABEL_PREFIX)));
export const hasAlchemyLabels = Effect.fn(function* (id, labels) {
    const expected = yield* createInternalLabels(id);
    return hasTags(expected, labels);
});
/**
 * Diff observed cloud labels against desired labels. Always pass
 * **observed** labels as `oldLabels` — never `olds.labels` or
 * `output.labels` — so adoption converges.
 */
export const diffLabels = diffTags;
/**
 * Hetzner label-selector string for a label map (`key=value,key=value`).
 */
export const labelSelector = (labels) => Object.entries(labels)
    .map(([key, value]) => `${key}=${value}`)
    .join(",");
//# sourceMappingURL=Labels.js.map