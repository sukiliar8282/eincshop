import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import type { TableBucketArn } from "./TableBucket.ts";
export interface NamespaceProps {
    /**
     * ARN of the table bucket that owns the namespace. Changing it replaces
     * the namespace.
     */
    tableBucket: TableBucketArn | string;
    /**
     * Name of the namespace. Must be 1-255 characters of lowercase letters,
     * numbers, and underscores, beginning with a letter or number. Changing
     * the name replaces the namespace.
     * @default a deterministic name derived from the app, stage, and logical ID
     */
    namespace?: string;
}
export interface Namespace extends Resource<"AWS.S3Tables.Namespace", NamespaceProps, {
    tableBucketArn: string;
    namespace: string;
    namespaceId: string | undefined;
    createdAt: Date;
    createdBy: string;
    ownerAccountId: string;
}, never, Providers> {
}
/**
 * A namespace within an Amazon S3 Tables {@link TableBucket} — a logical
 * grouping of {@link Table}s, equivalent to a database in an Iceberg catalog.
 * ### Creating Namespaces
 * **Example:** Basic Namespace
 * ```typescript
 * import * as S3Tables from "alchemy/AWS/S3Tables";
 *
 * const bucket = yield* S3Tables.TableBucket("Analytics");
 * const ns = yield* S3Tables.Namespace("Events", {
 *   tableBucket: bucket.tableBucketArn,
 * });
 * ```
 *
 * **Example:** Named Namespace
 * ```typescript
 * const ns = yield* S3Tables.Namespace("Events", {
 *   tableBucket: bucket.tableBucketArn,
 *   namespace: "raw_events",
 * });
 * ```
 *
 * @resource
 */
export declare const Namespace: import("../../Resource.ts").ResourceClass<Namespace>;
export declare const NamespaceProvider: () => import("effect/Layer").Layer<Provider.Provider<Namespace>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Namespace.d.ts.map