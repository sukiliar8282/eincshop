import * as redshift from "@distilled.cloud/aws/redshift";
import * as Effect from "effect/Effect";
/**
 * Convert Redshift's `[{ Key, Value }]` tag list into a plain record,
 * dropping any entry missing a key or value.
 */
export declare const toTagRecord: (tags: Array<{
    Key?: string;
    Value?: string;
}> | undefined) => Record<string, string>;
/** True when two string sets are equal ignoring order and duplicates. */
export declare const sameStringSet: (a: readonly string[] | undefined, b: readonly string[] | undefined) => boolean;
/**
 * Build the ARN of a provisioned-Redshift resource. Redshift describe
 * responses do not surface resource ARNs (only the namespace ARN on
 * clusters), so tag operations construct them from the ambient
 * account/region.
 */
export declare const redshiftArn: (region: string, accountId: string, resourceType: "cluster" | "subnetgroup" | "parametergroup" | "eventsubscription", name: string) => string;
/**
 * Apply a tag delta to a provisioned-Redshift resource via the shared
 * CreateTags/DeleteTags operations. `upsert`/`removed` come from `diffTags`
 * against OBSERVED cloud tags (Redshift describe responses carry tags
 * inline).
 */
export declare const applyRedshiftTagDelta: (input: {
    arn: string;
    upsert: Array<{
        Key: string;
        Value: string;
    }>;
    removed: string[];
}) => Effect.Effect<void, redshift.CreateTagsError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=internal.d.ts.map