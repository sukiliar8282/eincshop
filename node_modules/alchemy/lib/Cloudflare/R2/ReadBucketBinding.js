import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { makeBucketBinding, makeHelpers } from "./BucketBinding.js";
import { ReadBucket } from "./ReadBucket.js";
/**
 * Implementation of the {@link ReadBucket} binding that uses a Worker binding.
 */
export const ReadBucketBinding = Layer.effect(ReadBucket, Effect.suspend(() => makeBucketBinding({ makeClient: makeRead })));
/** Build the read half of the binding client. */
export const makeRead = ({ raw, use, wrapR2Object, wrapR2ObjectOrBody, }) => {
    const wrapR2Objects = (objects) => ({
        objects: objects.objects.map(wrapR2Object),
        delimitedPrefixes: objects.delimitedPrefixes,
        ...("cursor" in objects ? { cursor: objects.cursor } : {}),
        ...("truncated" in objects ? { truncated: objects.truncated } : {}),
    });
    return {
        raw,
        head: (key) => use((raw) => raw.head(key)).pipe(Effect.map((object) => (object ? wrapR2Object(object) : object))),
        get: ((key, options) => use((raw) => raw.get(key, options)).pipe(Effect.map(wrapR2ObjectOrBody))),
        list: (options) => use((raw) => raw.list(options)).pipe(Effect.map(wrapR2Objects)),
    };
};
//# sourceMappingURL=ReadBucketBinding.js.map