import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface StateTemplateProps {
    /**
     * Name of the state template. Must be 1-100 characters of
     * `[a-zA-Z0-9:_-]`. If omitted, a deterministic physical name is
     * generated. Changing the name replaces the state template.
     */
    stateTemplateName?: string;
    /**
     * Human-readable description of the state template. Updated in place.
     */
    description?: string;
    /**
     * ARN of the {@link SignalCatalog} the state template's signals come
     * from. Changing it replaces the state template.
     */
    signalCatalogArn: string;
    /**
     * Fully qualified names of the signals whose last-known state the
     * template tracks, e.g. `["Vehicle.Speed"]`. Synced in place via
     * add/remove deltas.
     */
    stateTemplateProperties: string[];
    /**
     * Vehicle attribute node paths added as extra dimensions on the state
     * data, e.g. `["Vehicle.VIN"]`. Updated in place.
     */
    dataExtraDimensions?: string[];
    /**
     * Vehicle attribute node paths added as extra dimensions on the MQTT
     * message metadata, e.g. `["Vehicle.VIN"]`. Updated in place.
     */
    metadataExtraDimensions?: string[];
    /**
     * User-defined tags for the state template.
     */
    tags?: Record<string, string>;
}
export interface StateTemplate extends Resource<"AWS.IoTFleetWise.StateTemplate", StateTemplateProps, {
    /** The name of the state template. */
    stateTemplateName: string;
    /** The ARN of the state template. */
    stateTemplateArn: string;
    /** The unique ID of the state template. */
    stateTemplateId: string | undefined;
    /** The signal catalog the state template's signals come from. */
    signalCatalogArn: string | undefined;
    /** The signals whose last-known state the template tracks. */
    stateTemplateProperties: string[];
}, never, Providers> {
}
/**
 * An AWS IoT FleetWise state template — a definition of which signals'
 * last-known state the Edge Agent reports for a {@link Vehicle}
 * (associated via the vehicle's `stateTemplates` prop).
 *
 * Only the description, tracked properties, and extra dimensions are
 * mutable — changing the name or signal catalog replaces the template.
 * AWS IoT FleetWise is allowlist-gated and offered in
 * `us-east-1`/`eu-central-1` only.
 * ### Creating a State Template
 * **Example:** Track Last-Known Speed
 * ```typescript
 * const template = yield* StateTemplate("SpeedState", {
 *   signalCatalogArn: catalog.signalCatalogArn,
 *   stateTemplateProperties: ["Vehicle.Speed"],
 * });
 * ```
 *
 * **Example:** Associate with a Vehicle
 * ```typescript
 * const vehicle = yield* Vehicle("TestVehicle", {
 *   modelManifestArn: model.modelManifestArn,
 *   decoderManifestArn: decoder.decoderManifestArn,
 *   stateTemplates: [
 *     {
 *       identifier: template.stateTemplateName,
 *       stateTemplateUpdateStrategy: { onChange: {} },
 *     },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export declare const StateTemplate: import("../../Resource.ts").ResourceClass<StateTemplate>;
export declare const StateTemplateProvider: () => import("effect/Layer").Layer<Provider.Provider<StateTemplate>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("@distilled.cloud/aws/Region").Region | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=StateTemplate.d.ts.map