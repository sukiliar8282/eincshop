import * as Effect from "effect/Effect";
import type { Index } from "./VectorIndex.ts";
import type { ReadVectorsClient } from "./VectorsRead.ts";
import type { WriteVectorsClient } from "./VectorsWrite.ts";
/** IAM actions granted by the read-level binding. */
export declare const readVectorsActions: readonly ["s3vectors:QueryVectors", "s3vectors:GetVectors", "s3vectors:ListVectors"];
/** IAM actions granted by the write-level binding. */
export declare const writeVectorsActions: readonly ["s3vectors:PutVectors", "s3vectors:DeleteVectors"];
/**
 * Build the shared body of an S3 Vectors data-plane `*Http` binding layer:
 * resolve the distilled operations once at layer construction (via
 * `makeClient`), register the least-privilege IAM statement on the host
 * Function at deploy time, and hand the per-index `indexArn` resolver to the
 * capability-specific client builder.
 */
export declare const makeVectorsHttpBinding: <Client, R>(options: {
    /** Capability name in the binding SID + trace spans, e.g. `"VectorsRead"`. */
    name: string;
    /** IAM actions granted on the bound index's ARN. */
    actions: readonly string[];
    /** Layer-scoped builder of the per-index typed runtime client. */
    makeClient: Effect.Effect<(indexArn: Effect.Effect<string>, label: string) => Client, never, R>;
}) => Effect.Effect<<I extends Index>(index: I) => Effect.Effect<Client, never, never>, never, R>;
/** Layer-scoped builder of the read-level {@link ReadVectorsClient}. */
export declare const makeReadVectorsClient: Effect.Effect<(IndexArn: Effect.Effect<string>, label: string) => ReadVectorsClient, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/** Layer-scoped builder of the write-level {@link WriteVectorsClient}. */
export declare const makeWriteVectorsClient: Effect.Effect<(IndexArn: Effect.Effect<string>, label: string) => WriteVectorsClient, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=BindingHttp.d.ts.map