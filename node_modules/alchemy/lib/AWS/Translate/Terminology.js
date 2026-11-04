import * as translate from "@distilled.cloud/aws/translate";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { readTranslateTags, syncTranslateTags } from "./internal.js";
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
export const Terminology = Resource("AWS.Translate.Terminology");
const toAttributes = (props) => ({
    terminologyName: props.Name,
    terminologyArn: props.Arn,
    sourceLanguageCode: props.SourceLanguageCode,
    targetLanguageCodes: props.TargetLanguageCodes
        ? [...props.TargetLanguageCodes]
        : undefined,
    termCount: props.TermCount,
    skippedTermCount: props.SkippedTermCount,
    sizeBytes: props.SizeBytes,
    directionality: props.Directionality,
});
export const TerminologyProvider = () => Provider.effect(Terminology, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        // Translate names must match ^([A-Za-z0-9-]_?)+$ (≤ 256 chars);
        // createPhysicalName's hyphenated output satisfies it directly.
        return (props.terminologyName ??
            (yield* createPhysicalName({ id, maxLength: 256 })));
    });
    const getOne = Effect.fn(function* (name) {
        return yield* translate
            .getTerminology({ Name: name })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    });
    return {
        stables: ["terminologyName", "terminologyArn"],
        diff: Effect.fn(function* ({ id, olds, news }) {
            if (!isResolved(news))
                return undefined;
            if ((yield* createName(id, olds)) !== (yield* createName(id, news))) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const name = output?.terminologyName ??
                (yield* createName(id, olds ?? { file: "", format: "CSV" }));
            const found = yield* getOne(name);
            if (found?.TerminologyProperties === undefined)
                return undefined;
            const attrs = toAttributes(found.TerminologyProperties);
            const tags = yield* readTranslateTags(attrs.terminologyArn);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, olds, output, session }) {
            const name = output?.terminologyName ?? (yield* createName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            // Observe — cloud state is authoritative.
            const observed = yield* getOne(name);
            // GetTerminology returns a presigned download location rather than
            // the file content, so `olds` is the hint for skipping a no-op
            // import; adoption (olds undefined) always imports to converge.
            const changed = olds === undefined ||
                olds.file !== news.file ||
                olds.format !== news.format ||
                (olds.directionality ?? "UNI") !== (news.directionality ?? "UNI") ||
                (olds.description ?? undefined) !==
                    (news.description ?? undefined) ||
                (olds.encryptionKeyId ?? undefined) !==
                    (news.encryptionKeyId ?? undefined);
            if (observed?.TerminologyProperties === undefined || changed) {
                const bytes = yield* Effect.sync(() => new TextEncoder().encode(news.file));
                yield* translate.importTerminology({
                    Name: name,
                    MergeStrategy: "OVERWRITE",
                    Description: news.description,
                    TerminologyData: {
                        // The File schema is a SensitiveBlob — the encoder unwraps
                        // the Redacted back to raw bytes on the wire.
                        File: Redacted.make(bytes),
                        Format: news.format,
                        Directionality: news.directionality,
                    },
                    EncryptionKey: news.encryptionKeyId
                        ? { Type: "KMS", Id: news.encryptionKeyId }
                        : undefined,
                });
            }
            const final = yield* getOne(name);
            const attrs = toAttributes(final.TerminologyProperties);
            yield* session.note(name);
            yield* syncTranslateTags(attrs.terminologyArn, desiredTags);
            return attrs;
        }),
        delete: Effect.fn(function* ({ output }) {
            // Idempotent — the terminology may already be gone.
            yield* translate
                .deleteTerminology({ Name: output.terminologyName })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
        list: () => translate.listTerminologies.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)
            .flatMap((page) => page.TerminologyPropertiesList ?? [])
            .filter((props) => props.Name && props.Arn)
            .map(toAttributes))),
    };
}));
//# sourceMappingURL=Terminology.js.map