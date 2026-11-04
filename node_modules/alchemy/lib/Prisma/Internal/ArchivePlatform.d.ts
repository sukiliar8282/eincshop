import * as Effect from "effect/Effect";
import { type VerifiedFile } from "./ArtifactFile.ts";
/**
 * Node/Bun boundary for filesystem operations that Effect's portable
 * FileSystem service cannot currently express: incremental directory handles
 * and streaming a verified file descriptor through gzip.
 */
export interface ArchiveTarFileEntry {
    readonly type: "file";
    readonly name: string;
    readonly mode: number;
    readonly file: VerifiedFile;
}
export interface ArchiveTarSymlinkEntry {
    readonly type: "symlink";
    readonly name: string;
    readonly mode: number;
    readonly linkname: string;
}
export type ArchiveTarEntry = ArchiveTarFileEntry | ArchiveTarSymlinkEntry;
export interface SecureDirectoryEntry {
    readonly name: string;
    readonly type: "Directory" | "File" | "SymbolicLink" | "Other";
}
interface CloseableDirectoryHandle {
    readonly close: () => void | Promise<void>;
}
export declare const closeDirectoryHandle: (handle: CloseableDirectoryHandle) => Promise<void>;
export declare const readDirectoryEntriesSecure: (options: {
    readonly directory: string;
    readonly relativePrefix: string;
    readonly ignore: readonly RegExp[];
    readonly entriesAlreadyObserved: number;
    readonly maxEntries: number;
}) => Effect.Effect<{
    entries: SecureDirectoryEntry[];
    observedEntries: number;
}, Error, never>;
export declare const writeCompressedArchiveSecure: (archivePath: string, entries: readonly ArchiveTarEntry[], manifest: Uint8Array, maxCompressedBytes: number) => Effect.Effect<void, Error, never>;
export declare const isArchivedRegularFile: (entries: readonly ArchiveTarEntry[], entrypointName: string) => boolean;
export {};
//# sourceMappingURL=ArchivePlatform.d.ts.map