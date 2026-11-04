import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { authorizeWith } from "../HttpClientUtils.js";
import { makeHttpBucketBinding } from "./BucketHttp.js";
import { makeReadR2HttpClient } from "./ReadBucketHttp.js";
import { ReadWriteBucket, } from "./ReadWriteBucket.js";
import { makeWriteR2HttpClient } from "./WriteBucketHttp.js";
/**
 * HTTP-backed implementation of the {@link ReadWriteBucket} binding.
 *
 * It creates a scoped {@link AccountApiToken} with the `Workers R2 Storage Read` and `Workers R2 Storage Write` permissions.
 */
export const ReadWriteBucketHttp = Layer.effect(ReadWriteBucket, Effect.suspend(() => makeHttpBucketBinding({
    permissionGroups: ["Workers R2 Storage Read", "Workers R2 Storage Write"],
    makeClient: (token, bucketName, jurisdiction) => makeReadWriteR2HttpClient({ authorize: authorizeWith(token), accountId: token.accountId }, bucketName, jurisdiction),
})));
/** Build the HTTP-backed {@link ReadWrite} over a bound token + bucket. */
export const makeReadWriteR2HttpClient = (auth, bucketName, jurisdiction) => ({
    ...makeReadR2HttpClient(auth, bucketName, jurisdiction),
    ...makeWriteR2HttpClient(auth, bucketName, jurisdiction),
});
//# sourceMappingURL=ReadWriteBucketHttp.js.map