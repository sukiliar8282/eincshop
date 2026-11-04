import * as iotfleetwise from "@distilled.cloud/aws/iotfleetwise";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface VehicleProps {
    /**
     * Name of the vehicle. Must be 1-100 characters of `[a-zA-Z0-9:_-]` and
     * match the corresponding AWS IoT thing name. If omitted, a
     * deterministic physical name is generated. Changing the name replaces
     * the vehicle.
     */
    vehicleName?: string;
    /**
     * ARN of an `ACTIVE` {@link ModelManifest} the vehicle is modeled by.
     * Updated in place.
     */
    modelManifestArn: string;
    /**
     * ARN of an `ACTIVE` {@link DecoderManifest} associated with the model
     * manifest. Updated in place.
     */
    decoderManifestArn: string;
    /**
     * Static attribute values (key/value strings) for attributes defined in
     * the model manifest, e.g. `{ "Vehicle.VIN": "1HGBH..." }`. Synced in
     * place with `attributeUpdateMode: "Overwrite"`.
     */
    attributes?: Record<string, string>;
    /**
     * Whether to create a new AWS IoT thing for the vehicle
     * (`"CreateIotThing"`) or validate an existing thing
     * (`"ValidateIotThingExists"`). Applied at creation only; changing it
     * replaces the vehicle.
     * @default "CreateIotThing"
     */
    associationBehavior?: iotfleetwise.VehicleAssociationBehavior;
    /**
     * State templates associated with the vehicle — each pairs a
     * {@link StateTemplate} identifier (name or ARN) with an update strategy
     * (`{ onChange: {} }` or `{ periodic: { stateTemplateUpdateRate } }`).
     * Synced in place via add/remove/update deltas.
     */
    stateTemplates?: iotfleetwise.StateTemplateAssociation[];
    /**
     * User-defined tags for the vehicle.
     */
    tags?: Record<string, string>;
}
export interface Vehicle extends Resource<"AWS.IoTFleetWise.Vehicle", VehicleProps, {
    /** The name of the vehicle (also the backing IoT thing name). */
    vehicleName: string;
    /** The ARN of the vehicle. */
    vehicleArn: string;
    /** The model manifest the vehicle conforms to. */
    modelManifestArn: string;
    /** The decoder manifest the vehicle uses. */
    decoderManifestArn: string;
    /** The static attributes stored on the vehicle. */
    attributes: Record<string, string>;
}, never, Providers> {
}
/**
 * An AWS IoT FleetWise vehicle — the digital twin of a physical vehicle,
 * created from an `ACTIVE` {@link ModelManifest} and
 * {@link DecoderManifest} pair and backed by an AWS IoT thing.
 * ### Creating a Vehicle
 * **Example:** Vehicle with an Auto-Created IoT Thing
 * ```typescript
 * const vehicle = yield* Vehicle("TestVehicle", {
 *   modelManifestArn: model.modelManifestArn,
 *   decoderManifestArn: decoder.decoderManifestArn,
 * });
 * ```
 *
 * **Example:** Vehicle with Attributes
 * ```typescript
 * const vehicle = yield* Vehicle("TestVehicle", {
 *   modelManifestArn: model.modelManifestArn,
 *   decoderManifestArn: decoder.decoderManifestArn,
 *   attributes: { "Vehicle.VIN": "1HGBH41JXMN109186" },
 *   tags: { plant: "fremont" },
 * });
 * ```
 *
 * @resource
 */
export declare const Vehicle: import("../../Resource.ts").ResourceClass<Vehicle>;
export declare const VehicleProvider: () => import("effect/Layer").Layer<Provider.Provider<Vehicle>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("@distilled.cloud/aws/Region").Region | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Vehicle.d.ts.map