import * as mediaconvert from "@distilled.cloud/aws/mediaconvert";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { readMcTags, syncMcTags } from "./internal.js";
/**
 * An AWS Elemental MediaConvert output preset — a reusable, named bundle of
 * output settings (container, video codec/resolution/bitrate, audio, and
 * captions) that job templates and jobs reference to produce one output.
 *
 * ### Creating a Preset
 * **Example:** MP4 / H.264 Preset
 * ```typescript
 * const preset = yield* MediaConvert.Preset("Mp4", {
 *   description: "1080p H.264 MP4",
 *   settings: {
 *     ContainerSettings: { Container: "MP4" },
 *     VideoDescription: {
 *       Width: 1920,
 *       Height: 1080,
 *       CodecSettings: {
 *         Codec: "H_264",
 *         H264Settings: { RateControlMode: "QVBR", MaxBitrate: 5000000 },
 *       },
 *     },
 *     AudioDescriptions: [
 *       {
 *         CodecSettings: {
 *           Codec: "AAC",
 *           AacSettings: {
 *             Bitrate: 96000,
 *             CodingMode: "CODING_MODE_2_0",
 *             SampleRate: 48000,
 *           },
 *         },
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * @resource
 */
export const Preset = Resource("AWS.MediaConvert.Preset");
export const PresetProvider = () => Provider.effect(Preset, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return (props.presetName ??
            (yield* createPhysicalName({ id, maxLength: 128 })));
    });
    const toAttrs = (preset) => ({
        presetName: preset.Name,
        presetArn: preset.Arn,
        type: preset.Type,
        category: preset.Category,
    });
    /** Get a preset by name; typed not-found → undefined. */
    const getPreset = Effect.fn(function* (name) {
        const response = yield* mediaconvert
            .getPreset({ Name: name })
            .pipe(Effect.catchTag("NotFoundException", () => Effect.succeed(undefined)));
        return response?.Preset;
    });
    return {
        stables: ["presetName", "presetArn"],
        diff: Effect.fn(function* ({ id, olds, news }) {
            if (!isResolved(news))
                return undefined;
            const oldName = yield* createName(id, olds);
            const newName = yield* createName(id, news);
            if (oldName !== newName)
                return { action: "replace" };
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const name = output?.presetName ?? (yield* createName(id, olds ?? {}));
            const preset = yield* getPreset(name);
            if (preset === undefined)
                return undefined;
            const attrs = toAttrs(preset);
            const tags = yield* readMcTags(preset.Arn);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            const name = output?.presetName ?? (yield* createName(id, news));
            // 1. Observe — cloud state is authoritative.
            let preset = yield* getPreset(name);
            // 2. Ensure — create if missing.
            if (preset === undefined) {
                const created = yield* mediaconvert.createPreset({
                    Name: name,
                    Description: news.description,
                    Category: news.category,
                    Settings: news.settings,
                    Tags: desiredTags,
                });
                preset = created.Preset;
            }
            else {
                // 3. Sync — UpdatePreset re-applies the mutable fields in place.
                const updated = yield* mediaconvert.updatePreset({
                    Name: name,
                    Description: news.description,
                    Category: news.category,
                    Settings: news.settings,
                });
                preset = updated.Preset;
            }
            // 3b. Sync tags — diff against OBSERVED cloud tags.
            yield* syncMcTags(preset.Arn, desiredTags);
            yield* session.note(name);
            return toAttrs(preset);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* mediaconvert
                .deletePreset({ Name: output.presetName })
                .pipe(Effect.catchTag("NotFoundException", () => Effect.void));
        }),
        list: () => mediaconvert.listPresets.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => page.Presets ?? [])), Effect.map((presets) => presets.map(toAttrs))),
    };
}));
//# sourceMappingURL=Preset.js.map