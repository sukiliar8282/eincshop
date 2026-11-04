/**
 * Derives a deterministic AppRegistry client token from the resource's
 * instance ID so retried creates never double-provision.
 */
export declare const clientToken: (instanceId: string) => string;
/**
 * Drops AWS-managed system tags (`aws:*`, case-insensitive) from an
 * observed tag map. AppRegistry stamps resources with system tags (e.g.
 * `aws:servicecatalog:applicationName`) that customers cannot remove —
 * including them in the diff baseline makes untagResource fail with
 * "Customers cannot remove tag keys starting with aws:".
 */
export declare const stripAwsSystemTags: (tags: Record<string, string>) => Record<string, string>;
//# sourceMappingURL=internal.d.ts.map