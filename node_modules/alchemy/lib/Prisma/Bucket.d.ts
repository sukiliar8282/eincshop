import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import type { Project } from "./Project.ts";
import type { Providers } from "./Providers.ts";
export interface BucketProps {
    /**
     * Project ID or `project.projectId` output that owns this bucket.
     */
    project: string | Project;
    /**
     * Bucket display name. Prisma generates a name when omitted. The display
     * name is not the provider-side S3 bucket name — S3 clients must use the
     * `bucketName` attribute of `Prisma.BucketAccessKey`.
     */
    name?: string;
    /**
     * Branch ID to scope the bucket to, e.g. for per-branch preview storage.
     */
    branchId?: string;
}
export interface Bucket extends Resource<"Prisma.Bucket", BucketProps, {
    /**
     * Prisma bucket ID.
     */
    bucketId: string;
    /**
     * Bucket display name. Not the provider-side S3 bucket name; S3 clients
     * must use the `bucketName` attribute of `Prisma.BucketAccessKey`.
     */
    name: string;
    /**
     * Project ID that owns the bucket.
     */
    projectId: string;
    /**
     * ISO timestamp when the bucket was created.
     */
    createdAt: string;
}, never, Providers> {
}
/**
 * A Prisma Object Store bucket inside a Prisma project.
 *
 * Project, name, and branch changes replace the bucket because the
 * Management API has no bucket update operation. Destroying this resource
 * deletes the bucket, its objects, and any remaining access keys — the
 * Management API cascades the deletion server-side.
 *
 * ### Creating a Bucket
 * **Example:** Bucket in a project
 * ```typescript
 * const bucket = yield* Prisma.Bucket("uploads", {
 *   project,
 *   name: "uploads",
 * });
 * ```
 *
 * ### Accessing a Bucket
 * **Example:** S3 credentials for a bucket
 * ```typescript
 * const key = yield* Prisma.BucketAccessKey("uploads-key", {
 *   bucket,
 *   role: "read_write",
 * });
 * ```
 *
 * @resource
 */
export declare const Bucket: import("../Resource.ts").ResourceClass<Bucket>;
declare const BucketProjectMismatchError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "BucketProjectMismatchError";
} & Readonly<A>;
/**
 * The bucket the provider observed belongs to a different project than the
 * one requested or persisted. Convergence and deletion both refuse rather
 * than acting on a bucket that is not the one this resource manages.
 */
export declare class BucketProjectMismatchError extends BucketProjectMismatchError_base<{
    bucketId: string;
    actualProjectId: string;
    expectedProjectId: string;
    message: string;
}> {
}
export declare const BucketProvider: () => import("effect/Layer").Layer<Provider.Provider<Bucket>, never, any>;
export {};
//# sourceMappingURL=Bucket.d.ts.map