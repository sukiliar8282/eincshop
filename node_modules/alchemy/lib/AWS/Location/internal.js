/**
 * Coerce a distilled Location `TagMap` (`{ [key]: string | undefined }`) into a
 * plain `Record<string, string>`, dropping any undefined values. Amazon
 * Location returns tags directly on every `Describe*` response, so this is the
 * single normalization used to feed `diffTags`/`hasAlchemyTags`.
 */
export const toTagRecord = (tags) => Object.fromEntries(Object.entries(tags ?? {}).filter((entry) => typeof entry[1] === "string"));
//# sourceMappingURL=internal.js.map