import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { makeBucketBinding, makeHelpers } from "./BucketBinding.js";
import { makeRead } from "./ReadBucketBinding.js";
import { ReadWriteBucket, } from "./ReadWriteBucket.js";
import { makeWrite } from "./WriteBucketBinding.js";
/**
 * Implementation of the {@link ReadWriteBucket} binding that uses a Worker binding.
 */
export const ReadWriteBucketBinding = Layer.effect(ReadWriteBucket, Effect.suspend(() => makeBucketBinding({ makeClient: makeReadWrite })));
/** Build the read-write binding client from its read and write halves. */
export const makeReadWrite = (helpers) => ({
    ...makeRead(helpers),
    ...makeWrite(helpers),
});
//# sourceMappingURL=ReadWriteBucketBinding.js.map