import * as Effect from "effect/Effect";
import { Stack } from "./Stack.ts";
import { Stage } from "./Stage.ts";
export type Tags = Record<string, string | undefined> | [string, string][] | {
    Key: string;
    Value: string;
}[];
export declare const normalizeTags: (tags: Tags) => Record<string, string | undefined>;
export declare const tagRecord: (tags: Tags | null | undefined) => Record<string, string>;
export declare const hasTags: (expectedTags: Tags, tags: Tags | undefined) => boolean;
export declare const createTagsList: (tags: Tags) => {
    Key: string;
    Value: string;
}[];
export declare const createInternalTags: (id: string) => Effect.Effect<{
    "alchemy::stack": string;
    "alchemy::stage": string;
    "alchemy::id": string;
}, never, Stack | Stage>;
/**
 * Strips the internal `alchemy::*` ownership tags from a tag/label map, leaving
 * only the user-facing entries. Useful when diffing observed cloud state (which
 * carries the internal branding) against the user's desired tags.
 */
export declare const stripInternalTags: (tags: Record<string, string> | null | undefined) => Record<string, string>;
/**
 * Creates AWS-compatible tag filters for finding resources by alchemy tags.
 * Use with AWS describe APIs that accept Filter parameters.
 */
export declare const createAlchemyTagFilters: (id: string) => Effect.Effect<{
    Name: string;
    Values: string[];
}[], never, Stack | Stage>;
/**
 * Checks if a resource has the expected alchemy tags for this app/stage/id.
 */
export declare const hasAlchemyTags: (id: string, tags: Tags | undefined) => Effect.Effect<boolean, never, Stack | Stage>;
export declare const diffTags: (oldTags: Record<string, string>, newTags: Record<string, string>) => {
    added: {
        Key: string;
        Value: string;
    }[];
    removed: string[];
    updated: {
        Key: string;
        Value: string;
    }[];
    upsert: {
        Key: string;
        Value: string;
    }[];
};
//# sourceMappingURL=Tags.d.ts.map