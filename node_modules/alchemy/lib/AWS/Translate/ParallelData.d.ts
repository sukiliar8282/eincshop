import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
declare const ParallelDataFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "ParallelDataFailed";
} & Readonly<A>;
/**
 * The parallel data import failed server-side (`Status: FAILED`) — usually a
 * malformed input file or an S3 URI the caller cannot read.
 */
export declare class ParallelDataFailed extends ParallelDataFailed_base<{
    readonly name: string;
    readonly message: string | undefined;
}> {
}
declare const ParallelDataNotConverged_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "ParallelDataNotConverged";
} & Readonly<A>;
/**
 * The parallel data did not reach a terminal status within the bounded
 * polling window.
 */
export declare class ParallelDataNotConverged extends ParallelDataNotConverged_base<{
    readonly name: string;
    readonly status: string | undefined;
}> {
}
export interface ParallelDataProps {
    /**
     * Name of the parallel data — up to 256 characters of letters, digits, and
     * hyphens (`^([A-Za-z0-9-]_?)+$`). If omitted, a unique name is generated
     * from the app, stage, and logical ID. Changing the name replaces the
     * parallel data.
     */
    parallelDataName?: string;
    /**
     * Description of the parallel data.
     */
    description?: string;
    /**
     * S3 URI of the parallel data input file (e.g.
     * `s3://my-bucket/examples.csv`). The caller must be able to read the
     * object. Updatable in place — a new import runs on change.
     */
    s3Uri: string;
    /**
     * Format of the input file: `TSV`, `CSV`, or `TMX`.
     */
    format?: "TSV" | "CSV" | "TMX";
    /**
     * Id of the customer-managed KMS key used to encrypt the parallel data.
     * If omitted, Translate uses an AWS-owned key.
     */
    encryptionKeyId?: string;
    /**
     * User-defined tags for the parallel data.
     */
    tags?: Record<string, string>;
}
export interface ParallelData extends Resource<"AWS.Translate.ParallelData", ParallelDataProps, {
    /**
     * Name of the parallel data — pass it as `ParallelDataNames` to
     * `StartTextTranslationJob` for Active Custom Translation.
     */
    parallelDataName: string;
    /**
     * ARN of the parallel data, e.g.
     * `arn:aws:translate:us-east-1:123456789012:parallel-data/style-examples`.
     */
    parallelDataArn: string;
    /** Status of the parallel data (`ACTIVE` once import succeeds). */
    status: string | undefined;
    /** Source language code detected from the input file, e.g. `en`. */
    sourceLanguageCode: string | undefined;
    /** Target language codes detected from the input file. */
    targetLanguageCodes: string[] | undefined;
    /** Number of records imported. */
    importedRecordCount: number | undefined;
    /** Number of records that failed to import. */
    failedRecordCount: number | undefined;
}, never, Providers> {
}
/**
 * Amazon Translate parallel data — segment-aligned translation examples
 * imported from S3 that steer the style, tone, and word choice of batch
 * translation jobs (Active Custom Translation). The import is asynchronous:
 * the resource waits for the parallel data to become `ACTIVE`.
 *
 * ### Managing Parallel Data
 * **Example:** Import parallel data from S3
 * ```typescript
 * const examples = yield* AWS.Translate.ParallelData("StyleExamples", {
 *   s3Uri: "s3://my-bucket/style-examples.csv",
 *   format: "CSV",
 * });
 * ```
 *
 * **Example:** Use parallel data in a batch translation job
 * ```typescript
 * const startJob = yield* AWS.Translate.StartTextTranslationJob(dataAccessRole);
 * yield* startJob({
 *   InputDataConfig: { S3Uri: "s3://my-bucket/input/", ContentType: "text/plain" },
 *   OutputDataConfig: { S3Uri: "s3://my-bucket/output/" },
 *   SourceLanguageCode: "en",
 *   TargetLanguageCodes: ["es"],
 *   ParallelDataNames: [examples.parallelDataName],
 * });
 * ```
 *
 * @resource
 */
export declare const ParallelData: import("../../Resource.ts").ResourceClass<ParallelData>;
export declare const ParallelDataProvider: () => import("effect/Layer").Layer<Provider.Provider<ParallelData>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=ParallelData.d.ts.map