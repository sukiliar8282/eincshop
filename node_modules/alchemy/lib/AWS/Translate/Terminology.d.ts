import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface TerminologyProps {
    /**
     * Name of the terminology — up to 256 characters of letters, digits, and
     * hyphens (`^([A-Za-z0-9-]_?)+$`). If omitted, a unique name is generated
     * from the app, stage, and logical ID. Changing the name replaces the
     * terminology.
     */
    terminologyName?: string;
    /**
     * Description of the terminology.
     */
    description?: string;
    /**
     * The terminology file content — term pairs in the given `format`. For
     * `CSV`, the first row is the language-code header (e.g. `en,es`) and each
     * subsequent row is a term pair. Updatable in place — `ImportTerminology`
     * is a true upsert (`MergeStrategy: OVERWRITE`); an overwrite takes up to
     * 10 minutes to fully propagate to translations.
     */
    file: string;
    /**
     * Format of the terminology `file`: `CSV`, `TMX`, or `TSV`.
     */
    format: "CSV" | "TMX" | "TSV";
    /**
     * Directionality of the terminology: `UNI` (source→targets, the default)
     * or `MULTI` (any listed language is a valid source).
     * @default "UNI"
     */
    directionality?: "UNI" | "MULTI";
    /**
     * Id of the customer-managed KMS key used to encrypt the terminology.
     * If omitted, Translate uses an AWS-owned key.
     */
    encryptionKeyId?: string;
    /**
     * User-defined tags for the terminology.
     */
    tags?: Record<string, string>;
}
export interface Terminology extends Resource<"AWS.Translate.Terminology", TerminologyProps, {
    /**
     * Name of the terminology — pass it as `TerminologyNames` to
     * `TranslateText`/`TranslateDocument` or batch translation jobs.
     */
    terminologyName: string;
    /**
     * ARN of the terminology, e.g.
     * `arn:aws:translate:us-east-1:123456789012:terminology/brand-glossary`.
     */
    terminologyArn: string;
    /** Source language code declared by the terminology file, e.g. `en`. */
    sourceLanguageCode: string | undefined;
    /** Target language codes declared by the terminology file. */
    targetLanguageCodes: string[] | undefined;
    /** Number of terms imported. */
    termCount: number | undefined;
    /** Number of terms skipped during import (malformed rows). */
    skippedTermCount: number | undefined;
    /** Size of the imported file in bytes. */
    sizeBytes: number | undefined;
    /** Directionality of the terminology (`UNI` or `MULTI`). */
    directionality: string | undefined;
}, never, Providers> {
}
/**
 * An Amazon Translate custom terminology — a glossary of term pairs (CSV,
 * TMX, or TSV) that pins how specific words and phrases (brand names,
 * product names, domain jargon) are translated. Reference it by name from
 * `TranslateText`, `TranslateDocument`, or batch translation jobs.
 *
 * ### Managing Terminologies
 * **Example:** Import a CSV terminology
 * ```typescript
 * const glossary = yield* AWS.Translate.Terminology("BrandGlossary", {
 *   file: ["en,es", "Alchemy,Alquimia"].join("\n"),
 *   format: "CSV",
 * });
 * ```
 *
 * **Example:** Translate text with the terminology applied
 * ```typescript
 * const translateText = yield* AWS.Translate.TranslateText();
 * const result = yield* translateText({
 *   Text: "Alchemy deploys infrastructure.",
 *   SourceLanguageCode: "en",
 *   TargetLanguageCode: "es",
 *   TerminologyNames: [glossary.terminologyName],
 * });
 * ```
 *
 * @resource
 */
export declare const Terminology: import("../../Resource.ts").ResourceClass<Terminology>;
export declare const TerminologyProvider: () => import("effect/Layer").Layer<Provider.Provider<Terminology>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Terminology.d.ts.map