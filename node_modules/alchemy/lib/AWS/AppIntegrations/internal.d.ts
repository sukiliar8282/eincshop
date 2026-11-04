/**
 * Shared internal helpers for the AppIntegrations service.
 * NOT exported from the service barrel.
 */
/**
 * The AppIntegrations wire TagMap is `{ [key: string]: string | undefined }`.
 * Collapse it to a plain `Record<string, string>` so it can be diffed with
 * `diffTags`.
 */
export declare const definedTags: (tags?: {
    [key: string]: string | undefined;
}) => Record<string, string>;
//# sourceMappingURL=internal.d.ts.map