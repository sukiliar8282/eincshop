import * as r53r from "@distilled.cloud/aws/route53resolver";
import * as Effect from "effect/Effect";
/**
 * Fetch the observed tags on a Route 53 Resolver resource as a plain record.
 * Any failure (e.g. the resource vanished between observation and the tag
 * read, or the resource is an AWS-managed rule we cannot read tags for)
 * degrades to an empty record so callers can still converge.
 *
 * @internal
 */
export declare const fetchResolverTags: (arn: string) => Effect.Effect<Record<string, string>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Converge the tags on a Route 53 Resolver resource to `desired`, diffing
 * against the OBSERVED cloud tags (never olds/output) so adoption converges.
 *
 * @internal
 */
export declare const syncResolverTags: (arn: string, desired: Record<string, string>) => Effect.Effect<void, r53r.TagResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Convert a tag record into the wire `Tag[]` shape for create calls.
 *
 * @internal
 */
export declare const toResolverTagList: (tags: Record<string, string>) => r53r.Tag[];
/**
 * Order-insensitive string set equality.
 *
 * @internal
 */
export declare const sameStringSet: (a: readonly string[], b: readonly string[]) => boolean;
//# sourceMappingURL=internal.d.ts.map