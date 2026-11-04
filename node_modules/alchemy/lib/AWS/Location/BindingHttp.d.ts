import * as Effect from "effect/Effect";
import type { GeofenceCollection } from "./GeofenceCollection.ts";
import type { Map as LocationMap } from "./Map.ts";
import type { PlaceIndex } from "./PlaceIndex.ts";
import type { RouteCalculator } from "./RouteCalculator.ts";
import type { Tracker } from "./Tracker.ts";
/**
 * Shared scaffolding for the Amazon Location Service runtime bindings.
 *
 * NOT exported from `index.ts` — every `{Op}Http.ts` in this service is a
 * thin `Layer.effect(Cap, makeLocation…HttpBinding({ … }))` over one of the
 * builders below. Everything except the operation and the IAM action list is
 * boilerplate: each data-plane operation is scoped to exactly one Location
 * resource (tracker, geofence collection, place index, route calculator, or
 * map), whose physical name is injected into the request and whose ARN
 * receives the grant. Batch metadata jobs are account-scoped.
 */
/**
 * Build the impl Effect for a tracker-scoped Location operation: the runtime
 * callable injects the bound {@link Tracker}'s name as `TrackerName` and the
 * deploy-time half grants `actions` on the tracker ARN.
 */
export declare const makeLocationTrackerHttpBinding: <I extends {
    TrackerName: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Location.GetDevicePosition`. */
    tag: string;
    /** The distilled operation; `TrackerName` is injected from the tracker. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the tracker ARN. */
    actions: readonly string[];
}) => Effect.Effect<(tracker: Tracker) => Effect.Effect<(request?: Omit<I, "TrackerName"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a geofence-collection-scoped Location operation:
 * the runtime callable injects the bound {@link GeofenceCollection}'s name as
 * `CollectionName` and the deploy-time half grants `actions` on the
 * collection ARN.
 */
export declare const makeLocationCollectionHttpBinding: <I extends {
    CollectionName: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Location.PutGeofence`. */
    tag: string;
    /** The distilled operation; `CollectionName` is injected. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the geofence collection ARN. */
    actions: readonly string[];
}) => Effect.Effect<(collection: GeofenceCollection) => Effect.Effect<(request?: Omit<I, "CollectionName"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a place-index-scoped Location operation: the
 * runtime callable injects the bound {@link PlaceIndex}'s name as `IndexName`
 * and the deploy-time half grants `actions` on the index ARN.
 */
export declare const makeLocationPlaceIndexHttpBinding: <I extends {
    IndexName: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Location.SearchPlaceIndexForText`. */
    tag: string;
    /** The distilled operation; `IndexName` is injected. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the place index ARN. */
    actions: readonly string[];
}) => Effect.Effect<(index: PlaceIndex) => Effect.Effect<(request?: Omit<I, "IndexName"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a route-calculator-scoped Location operation: the
 * runtime callable injects the bound {@link RouteCalculator}'s name as
 * `CalculatorName` and the deploy-time half grants `actions` on the
 * calculator ARN.
 */
export declare const makeLocationCalculatorHttpBinding: <I extends {
    CalculatorName: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Location.CalculateRoute`. */
    tag: string;
    /** The distilled operation; `CalculatorName` is injected. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the route calculator ARN. */
    actions: readonly string[];
}) => Effect.Effect<(calculator: RouteCalculator) => Effect.Effect<(request?: Omit<I, "CalculatorName"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a map-scoped Location operation: the runtime
 * callable injects the bound {@link LocationMap}'s name as `MapName` and the
 * deploy-time half grants `actions` on the map ARN.
 */
export declare const makeLocationMapHttpBinding: <I extends {
    MapName: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Location.GetMapTile`. */
    tag: string;
    /** The distilled operation; `MapName` is injected. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the map ARN. */
    actions: readonly string[];
}) => Effect.Effect<(map: LocationMap) => Effect.Effect<(request?: Omit<I, "MapName"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an account-scoped Location operation (the batch
 * metadata jobs API: `ListJobs`, `GetJob`, `CancelJob`): jobs are created at
 * runtime so their ARNs are unknowable at deploy time — the deploy-time half
 * grants `actions` on `*`.
 */
export declare const makeLocationAccountHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Location.ListJobs`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map