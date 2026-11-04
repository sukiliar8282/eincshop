import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
export interface VerifiedFile {
    readonly _tag: "VerifiedFile" | "ArtifactFile";
    readonly path: string;
    readonly size: number;
    readonly mode: number;
    readonly identity: {
        readonly dev: string;
        readonly ino: string;
        readonly size: string;
        readonly mtimeNs: string;
        readonly ctimeNs: string;
    };
}
export interface ArtifactFile extends VerifiedFile {
    readonly _tag: "ArtifactFile";
    readonly sha256: string;
    readonly cleanup: Effect.Effect<void>;
}
export declare const inspectVerifiedFile: (inputPath: string, maxBytes: number, options?: {
    readonly allowEmpty?: boolean;
    readonly description?: string;
}) => Effect.Effect<{
    _tag: "VerifiedFile";
    path: string;
    size: number;
    mode: number;
    identity: {
        readonly dev: string;
        readonly ino: string;
        readonly size: string;
        readonly mtimeNs: string;
        readonly ctimeNs: string;
    };
}, Error, never>;
export declare const inspectArtifactFile: (inputPath: string, maxBytes: number, options?: {
    readonly cleanup?: Effect.Effect<void>;
    readonly description?: string;
}) => Effect.Effect<{
    path: string;
    size: number;
    mode: number;
    identity: {
        readonly dev: string;
        readonly ino: string;
        readonly size: string;
        readonly mtimeNs: string;
        readonly ctimeNs: string;
    };
    _tag: "ArtifactFile";
    sha256: string;
    cleanup: Effect.Effect<void, never, never>;
}, Error, never>;
export declare const artifactFileStream: (artifact: ArtifactFile) => Stream.Stream<Uint8Array<ArrayBufferLike>, Error, never>;
export declare const verifiedFileChunks: (file: VerifiedFile) => AsyncGenerator<Uint8Array<ArrayBufferLike>, any, any>;
export declare const readArtifactFile: (artifact: ArtifactFile) => Effect.Effect<Uint8Array<ArrayBuffer>, Error, never>;
//# sourceMappingURL=ArtifactFile.d.ts.map