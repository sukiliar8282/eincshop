import { Endpoint } from "@distilled.cloud/aws";
import * as Layer from "effect/Layer";
import { AWSEnvironment } from "./Environment.ts";
export declare const of: (endpoint: string) => Layer.Layer<Endpoint.Endpoint, never, never>;
/**
 * Derive a custom endpoint (if any) from the surrounding
 * {@link AWSEnvironment}. If the environment has no `endpoint` set, this
 * Layer is empty (the SDK uses its default endpoint resolver).
 */
export declare const fromEnvironment: Layer.Layer<never, never, AWSEnvironment>;
/**
 * Explicitly "no custom endpoint" — the SDK falls back to its default
 * endpoint resolver.
 *
 * Use this (never `Layer.empty`) when an AWS call is made from *inside*
 * the construction of {@link AWSEnvironment}: leaving `Endpoint`
 * unprovided lets the call fall through to {@link fromEnvironment},
 * whose service Effect re-enters the in-flight `AWSEnvironment` cache and
 * deadlocks the fiber with no I/O and no timer pending.
 */
export declare const none: Layer.Layer<Endpoint.Endpoint, never, never>;
//# sourceMappingURL=Endpoint.d.ts.map