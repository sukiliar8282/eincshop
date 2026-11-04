/**
 * Coerce a distilled Location `TagMap` (`{ [key]: string | undefined }`) into a
 * plain `Record<string, string>`, dropping any undefined values. Amazon
 * Location returns tags directly on every `Describe*` response, so this is the
 * single normalization used to feed `diffTags`/`hasAlchemyTags`.
 */
export declare const toTagRecord: (tags: {
    [key: string]: string | undefined;
} | undefined) => Record<string, string>;
//# sourceMappingURL=internal.d.ts.map