import * as Effect from "effect/Effect";
import * as HttpClient from "effect/unstable/http/HttpClient";
import { type ArtifactFile } from "./ArtifactFile.ts";
export declare const executeArtifactUpload: (uploadUrl: string, artifact: Uint8Array | ArtifactFile, contentType: string) => Effect.Effect<undefined, Error, HttpClient.HttpClient>;
//# sourceMappingURL=ArtifactUpload.d.ts.map