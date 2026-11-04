import * as logs from "@distilled.cloud/aws/cloudwatch-logs";
import * as imagebuilder from "@distilled.cloud/aws/imagebuilder";
import * as Effect from "effect/Effect";
import type { Input } from "../../Input.ts";
import { AWSEnvironment } from "../Environment.ts";
/**
 * Plan-time replacement check for immutable Image Builder versions
 * (components, image recipes). `news` may still carry unresolved Outputs
 * at plan time — e.g. the build-version ARN of a component being replaced
 * in the same deploy — so compare per key and skip only the keys that are
 * unresolved. A resolved change on an immutable key (like a
 * `semanticVersion` bump) must still plan a replacement; drift hidden
 * behind an unresolved key is caught by the provider's reconcile
 * immutability guard.
 */
export declare const immutableVersionKeysChanged: <Props extends object>(olds: Props, news: Input<Props>, keys: readonly (keyof Props)[]) => boolean;
/**
 * Image Builder rejects deletion of a resource that another resource still
 * references (e.g. a component referenced by a not-yet-deleted recipe, or a
 * recipe referenced by a pipeline) with `ResourceDependencyException`.
 * During a replacement the engine deletes the displaced resources without
 * ordering guarantees, so retry through the window while the dependents are
 * deleted (bounded).
 */
export declare const retryWhileDependedOn: <A, E extends {
    _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
/**
 * Delete one exact CloudWatch log group that Image Builder auto-created for
 * an Alchemy-owned recipe or pipeline. Callers derive the name from their
 * owned resource output; this helper never scans or deletes by broad prefix.
 */
export declare const deleteImageBuilderLogGroup: (logGroupName: string) => Effect.Effect<undefined, logs.InvalidParameterException | logs.OperationAbortedException | logs.ServiceUnavailableException | logs.ValidationException | import("@distilled.cloud/aws/Errors").CommonErrors, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Convert an Image Builder wire tag map (values may be undefined) into a
 * plain string record.
 */
export declare const toTagRecord: (tags: {
    [key: string]: string | undefined;
} | undefined) => Record<string, string>;
/**
 * Read the observed tags of an Image Builder resource. Tag reads are
 * best-effort — a failure (e.g. a race with deletion) reports no tags.
 */
export declare const readImageBuilderTags: (arn: string) => Effect.Effect<Record<string, string>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Sync tags on an Image Builder resource: diff the OBSERVED cloud tags
 * against the desired set and apply only the delta.
 */
export declare const syncImageBuilderTags: (arn: string, desiredTags: Record<string, string>) => Effect.Effect<void, imagebuilder.TagResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Construct the deterministic ARN of an Image Builder resource in the
 * ambient account/region. Image Builder lowercases resource names in ARNs.
 *
 * @param resourceType e.g. `image-recipe`, `infrastructure-configuration`
 * @param resourcePath the name (plus `/{version}` segments where relevant)
 */
export declare const imageBuilderArn: (resourceType: string, resourcePath: string) => Effect.Effect<string, never, AWSEnvironment>;
/**
 * Structural drift check between the desired value the user specified and
 * the observed cloud value. `undefined` desired values are "unspecified"
 * (no drift — the service fills defaults we must not fight). Objects are
 * compared as subsets: every key the user specified must match; extra
 * observed keys (server defaults) are ignored. Arrays compare length +
 * element-wise.
 */
export declare const driftedFrom: (observed: unknown, desired: unknown) => boolean;
//# sourceMappingURL=internal.d.ts.map