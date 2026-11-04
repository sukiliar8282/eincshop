import * as omics from "@distilled.cloud/aws/omics";
import * as Effect from "effect/Effect";
/**
 * Reads the observed tags for a HealthOmics resource by ARN. Tolerates a
 * not-found race (the resource can vanish between observation and this call)
 * by returning an empty map.
 *
 * NOT exported from the service barrel — shared scaffolding for the Omics
 * resource providers only.
 */
export declare const fetchOmicsTags: (resourceArn: string) => Effect.Effect<Record<string, string>, omics.AccessDeniedException | omics.ConflictException | omics.InternalServerException | omics.RequestTimeoutException | omics.ServiceQuotaExceededException | omics.ThrottlingException | omics.ValidationException | import("@distilled.cloud/aws/Errors").CommonErrors, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Converges the tags on a HealthOmics resource to `desired`, diffing against
 * the OBSERVED cloud tags (not olds/output) so adoption converges. Applies
 * only the delta: `tagResource` for upserts, `untagResource` for removals.
 */
export declare const syncOmicsTags: (resourceArn: string, desired: Record<string, string>) => Effect.Effect<void, omics.TagResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=internal.d.ts.map