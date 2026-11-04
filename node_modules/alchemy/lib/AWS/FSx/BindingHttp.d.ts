import * as Effect from "effect/Effect";
import type { FileSystem } from "./FileSystem.ts";
/**
 * Shared scaffolding for the FSx runtime bindings.
 *
 * NOT exported from `index.ts` — every `{Op}Http.ts` in this service is a
 * thin `Layer.effect(Cap, makeFSx…HttpBinding({ … }))` over one of the two
 * builders below. Everything except the operation, the IAM action list, and
 * (for file-system-scoped operations) the injected file system id is
 * boilerplate.
 */
/**
 * Build the impl Effect for a file-system-scoped FSx operation: the runtime
 * callable injects the bound {@link FileSystem}'s id (as `FileSystemId`, or
 * as `FileSystemIds: [id]` for the describe operation) and the deploy-time
 * half grants `actions` on the file system's ARN.
 */
export declare const makeFSxFileSystemHttpBinding: <I extends {
    FileSystemId?: string;
    FileSystemIds?: string[];
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.FSx.CreateBackup`. */
    tag: string;
    /** The distilled operation; the file system id is injected. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the file system ARN (+ `extraResourceArns`). */
    actions: readonly string[];
    /**
     * How the bound file system's id is injected into the request:
     * `FileSystemId` (default) or `FileSystemIds` (`DescribeFileSystems`
     * takes a plural array).
     * @default "FileSystemId"
     */
    requestKey?: "FileSystemId" | "FileSystemIds";
    /**
     * Additional ARN patterns granted alongside the file system ARN. Used for
     * operations that also authorize on a resource created by the call itself
     * (e.g. `CreateBackup` authorizes on the new backup's ARN, unknowable at
     * deploy time — grant `arn:aws:fsx:*:*:backup/*`).
     */
    extraResourceArns?: readonly string[];
}) => Effect.Effect<(fileSystem: FileSystem) => Effect.Effect<(request?: Omit<I, "FileSystemId" | "FileSystemIds"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an account-level FSx operation (no file-system
 * argument): the deploy-time half grants `actions` on `*`. Used for
 * operations that authorize against ARNs unknowable at deploy time (e.g.
 * backups, snapshots, and data repository tasks created at runtime) and for
 * account-wide describes.
 */
export declare const makeFSxAccountHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.FSx.DescribeBackups`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map