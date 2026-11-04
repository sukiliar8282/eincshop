import * as iotfleetwise from "@distilled.cloud/aws/iotfleetwise";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface SignalCatalogProps {
    /**
     * Name of the signal catalog. Must be 1-100 characters of
     * `[a-zA-Z0-9:_-]`. If omitted, a deterministic physical name is
     * generated. Changing the name replaces the catalog.
     */
    signalCatalogName?: string;
    /**
     * Human-readable description of the signal catalog.
     */
    description?: string;
    /**
     * Signal nodes forming the catalog's tree — branches, sensors,
     * actuators, attributes, structs and properties. Each node is one of the
     * union variants (`{ branch }`, `{ sensor }`, ...) keyed by
     * `fullyQualifiedName`. Updated in place via
     * `nodesToAdd`/`nodesToUpdate`/`nodesToRemove` deltas.
     */
    nodes?: iotfleetwise.Node[];
    /**
     * User-defined tags for the signal catalog.
     */
    tags?: Record<string, string>;
}
export interface SignalCatalog extends Resource<"AWS.IoTFleetWise.SignalCatalog", SignalCatalogProps, {
    /** The name of the signal catalog. */
    signalCatalogName: string;
    /** The ARN of the signal catalog. */
    signalCatalogArn: string;
}, never, Providers> {
}
/**
 * An AWS IoT FleetWise signal catalog — the account-wide collection of
 * standardized vehicle signals (branches, sensors, actuators, attributes)
 * that model manifests draw from.
 *
 * AWS IoT FleetWise is offered in `us-east-1` and `eu-central-1` only; the
 * provider follows the ambient region when supported and pins `us-east-1`
 * otherwise. Access to the service is allowlist-gated by AWS — accounts
 * without access receive `AccessDeniedException` on every operation.
 * ### Creating a Signal Catalog
 * **Example:** Catalog with a Branch and a Sensor
 * ```typescript
 * const catalog = yield* SignalCatalog("Signals", {
 *   nodes: [
 *     { branch: { fullyQualifiedName: "Vehicle" } },
 *     {
 *       sensor: {
 *         fullyQualifiedName: "Vehicle.Speed",
 *         dataType: "DOUBLE",
 *         unit: "km/h",
 *       },
 *     },
 *   ],
 * });
 * ```
 *
 * **Example:** Catalog with Attributes
 * ```typescript
 * const catalog = yield* SignalCatalog("Signals", {
 *   description: "vehicle signals",
 *   nodes: [
 *     { branch: { fullyQualifiedName: "Vehicle" } },
 *     {
 *       attribute: {
 *         fullyQualifiedName: "Vehicle.VIN",
 *         dataType: "STRING",
 *       },
 *     },
 *   ],
 *   tags: { team: "telemetry" },
 * });
 * ```
 *
 * @resource
 */
export declare const SignalCatalog: import("../../Resource.ts").ResourceClass<SignalCatalog>;
export declare const SignalCatalogProvider: () => import("effect/Layer").Layer<Provider.Provider<SignalCatalog>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("@distilled.cloud/aws/Region").Region | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=SignalCatalog.d.ts.map