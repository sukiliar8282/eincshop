import { Region, type RegionName } from "@distilled.cloud/aws/Region";
import * as iotfleetwise from "@distilled.cloud/aws/iotfleetwise";
import * as Effect from "effect/Effect";
/** @internal */
export declare const FLEETWISE_HOME_REGION: RegionName;
/**
 * Run a distilled IoT FleetWise effect in a supported region: the ambient
 * region when FleetWise is offered there, otherwise `us-east-1`.
 *
 * `Region`'s service value is an `Effect<RegionName>` (see
 * `@distilled.cloud/aws/Region`), so it is provided as an effect, not a
 * bare string.
 *
 * @internal
 */
export declare const inFleetWiseRegion: <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R | Region>;
/**
 * Read the observed tags of an IoT FleetWise resource as a plain record.
 * Tag-read failures degrade to an empty record so tag drift never blocks
 * reads of the resource itself.
 *
 * @internal
 */
export declare const readFleetWiseTags: (arn: string) => Effect.Effect<Record<string, string>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | Region>;
/**
 * Convert a tag record to the FleetWise wire shape.
 *
 * @internal
 */
export declare const toFleetWiseTagList: (tags: Record<string, string>) => iotfleetwise.Tag[];
/**
 * Converge an IoT FleetWise resource's tags on the desired record, diffing
 * against OBSERVED cloud tags (never `olds`/`output`).
 *
 * @internal
 */
export declare const syncFleetWiseTags: (arn: string, desired: Record<string, string>) => Effect.Effect<void, iotfleetwise.TagResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | Region>;
/**
 * Retry an effect through FleetWise `ConflictException` windows (e.g. a
 * signal catalog whose model manifests are still deleting, or a decoder
 * manifest with vehicles detaching). Bounded: ~30s total.
 *
 * Explicitly typed: inlining `Effect.retry` with options in provider
 * lifecycle code widens the provider layer to `unknown` in declaration
 * emit.
 *
 * @internal
 */
export declare const retryWhileConflict: <A, E extends {
    readonly _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
/**
 * Bounded eventual-consistency retry for observe-after-write reads
 * (~20s total).
 *
 * @internal
 */
export declare const retryObservation: <A, E, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
/**
 * Order-insensitive deep equality over plain JSON-ish values (props and
 * observed FleetWise structures). Object keys are sorted; arrays stay
 * positional.
 *
 * @internal
 */
export declare const stableEquals: (left: unknown, right: unknown) => boolean;
//# sourceMappingURL=internal.d.ts.map