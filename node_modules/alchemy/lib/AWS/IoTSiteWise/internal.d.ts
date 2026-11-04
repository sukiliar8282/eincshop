import * as sitewise from "@distilled.cloud/aws/iotsitewise";
import * as Effect from "effect/Effect";
/**
 * Fetch the observed tags on an IoT SiteWise resource ARN as a plain
 * string map (SiteWise's TagMap allows `undefined` values on the wire).
 */
export declare const fetchSiteWiseTags: (arn: string) => Effect.Effect<Record<string, string>, sitewise.ConflictingOperationException | sitewise.InternalFailureException | sitewise.InvalidRequestException | sitewise.LimitExceededException | sitewise.ThrottlingException | sitewise.UnauthorizedException | import("@distilled.cloud/aws/Errors").CommonErrors, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Converge the tags on a SiteWise resource ARN from the observed cloud
 * tags to the desired map (untag removed keys, upsert added/changed).
 */
export declare const syncSiteWiseTags: (arn: string, observed: Record<string, string>, desired: Record<string, string>) => Effect.Effect<void, sitewise.TagResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Structural equality between a desired shape and the observed cloud
 * state, ignoring observed-only keys (server defaults, generated ids the
 * caller didn't pin, etc.).
 */
export declare const matchesDesired: (desired: unknown, observed: unknown) => boolean;
//# sourceMappingURL=internal.d.ts.map