import { Region as AwsRegion } from "@distilled.cloud/aws/Region";
import * as Effect from "effect/Effect";
export declare const GA_REGION: "us-west-2";
export declare const withGaRegion: <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, Exclude<R, AwsRegion>>;
/**
 * Global Accelerator serializes configuration changes per accelerator as
 * "transactions"; a second mutation while one is propagating is rejected with
 * `TransactionInProgressException` (or `ConflictException`). Retry on a
 * bounded schedule (~60s) until the in-flight transaction lands.
 *
 * NOTE: explicit return annotation is load-bearing — an inline `Effect.retry`
 * in provider lifecycle code leaks `Retry.Return` conditionals into
 * declaration emit and widens the provider layer to `unknown` R.
 */
export declare const retryGaTransaction: <A, E extends {
    _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
/**
 * Deletion is subject to both GA's serialized transactions and occasional
 * transient internal-service failures. Keep the retry bounded to about one
 * minute so teardown converges without hanging indefinitely.
 */
export declare const retryGaDeletion: <A, E extends {
    _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
/**
 * `deleteAccelerator` requires the accelerator to be fully disabled and all
 * listeners removed. Both conditions clear asynchronously after the disabling
 * `updateAccelerator` / dependent deletes return, so retry the delete on a
 * bounded schedule (~3 minutes) until the disable transaction propagates.
 */
export declare const retryUntilAcceleratorDeletable: <A, E extends {
    _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
/**
 * `deleteListener` is rejected with `AssociatedEndpointGroupFoundException`
 * while a just-deleted endpoint group is still detaching. Retry briefly.
 */
export declare const retryUntilListenerDeletable: <A, E extends {
    _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
//# sourceMappingURL=common.d.ts.map