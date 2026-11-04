import * as redshiftserverless from "@distilled.cloud/aws/redshift-serverless";
import * as Effect from "effect/Effect";
import { diffTags } from "../../Tags.js";
/**
 * Convert a Redshift Serverless wire tag list (`{ key, value }`) into a plain
 * record, dropping malformed entries.
 */
export const toTagRecord = (tags) => Object.fromEntries((tags ?? [])
    .filter((tag) => typeof tag.key === "string" && typeof tag.value === "string")
    .map((tag) => [tag.key, tag.value]));
/**
 * Convert a desired tag record into the wire tag list (`{ key, value }`) used
 * by create/tag calls.
 */
export const toWireTags = (tags) => Object.entries(tags).map(([key, value]) => ({ key, value }));
/**
 * Read the observed tags of a Redshift Serverless resource. Tag reads are
 * best-effort — a failure (e.g. a race with deletion) reports no tags.
 */
export const readTags = Effect.fn(function* (arn) {
    const response = yield* redshiftserverless
        .listTagsForResource({ resourceArn: arn })
        .pipe(Effect.catch(() => Effect.succeed(undefined)));
    return toTagRecord(response?.tags);
});
/**
 * Sync tags on a Redshift Serverless resource: diff the OBSERVED cloud tags
 * against the desired set and apply only the delta.
 */
export const syncTags = Effect.fn(function* (arn, desiredTags) {
    const observedTags = yield* readTags(arn);
    const { removed, upsert } = diffTags(observedTags, desiredTags);
    if (upsert.length > 0) {
        yield* redshiftserverless.tagResource({
            resourceArn: arn,
            tags: upsert.map(({ Key, Value }) => ({ key: Key, value: Value })),
        });
    }
    if (removed.length > 0) {
        yield* redshiftserverless.untagResource({
            resourceArn: arn,
            tagKeys: removed,
        });
    }
});
//# sourceMappingURL=internal.js.map