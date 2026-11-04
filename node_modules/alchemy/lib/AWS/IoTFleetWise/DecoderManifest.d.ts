import * as iotfleetwise from "@distilled.cloud/aws/iotfleetwise";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface DecoderManifestProps {
    /**
     * Name of the decoder manifest. Must be 1-100 characters of
     * `[a-zA-Z0-9:_-]`. If omitted, a deterministic physical name is
     * generated. Changing the name replaces the manifest.
     */
    decoderManifestName?: string;
    /**
     * ARN of the {@link ModelManifest} the decoder manifest decodes signals
     * for. Changing the model manifest replaces the decoder manifest.
     */
    modelManifestArn: string;
    /**
     * Human-readable description of the decoder manifest.
     */
    description?: string;
    /**
     * Network interfaces (CAN, OBD, vehicle middleware or custom decoding)
     * the signal decoders reference, keyed by `interfaceId`. Updated in
     * place via add/update/remove deltas (only while the manifest is in
     * `DRAFT` status).
     */
    networkInterfaces?: iotfleetwise.NetworkInterface[];
    /**
     * Decoding rules mapping model-manifest signals onto network-interface
     * messages, keyed by `fullyQualifiedName`. Updated in place via
     * add/update/remove deltas (only while the manifest is in `DRAFT`
     * status).
     */
    signalDecoders?: iotfleetwise.SignalDecoder[];
    /**
     * Use `"CUSTOM_DECODING"` to default any unmapped model-manifest signal
     * to a custom decoding signal.
     */
    defaultForUnmappedSignals?: iotfleetwise.DefaultForUnmappedSignalsType;
    /**
     * Status of the manifest. Vehicles can only be created from an `ACTIVE`
     * manifest; decoder/interface changes require `DRAFT`.
     * @default "DRAFT"
     */
    status?: "ACTIVE" | "DRAFT";
    /**
     * User-defined tags for the decoder manifest.
     */
    tags?: Record<string, string>;
}
export interface DecoderManifest extends Resource<"AWS.IoTFleetWise.DecoderManifest", DecoderManifestProps, {
    /** The name of the decoder manifest. */
    decoderManifestName: string;
    /** The ARN of the decoder manifest. */
    decoderManifestArn: string;
    /** The current status of the manifest (`ACTIVE`, `DRAFT`, ...). */
    status: string;
    /** The model manifest the decoders map to. */
    modelManifestArn: string | undefined;
}, never, Providers> {
}
/**
 * An AWS IoT FleetWise decoder manifest — the decoding rules (network
 * interfaces + signal decoders) that turn raw bus data from a vehicle
 * modeled by a {@link ModelManifest} into standardized signals.
 *
 * A manifest is created in `DRAFT` status; set `status: "ACTIVE"` to make
 * it usable by vehicles. AWS IoT FleetWise is allowlist-gated and offered
 * in `us-east-1`/`eu-central-1` only.
 * ### Creating a Decoder Manifest
 * **Example:** OBD Decoder for a Speed Signal
 * ```typescript
 * const decoder = yield* DecoderManifest("SedanDecoder", {
 *   modelManifestArn: model.modelManifestArn,
 *   networkInterfaces: [
 *     {
 *       interfaceId: "obd0",
 *       type: "OBD_INTERFACE",
 *       obdInterface: { name: "obd", requestMessageId: 2015 },
 *     },
 *   ],
 *   signalDecoders: [
 *     {
 *       fullyQualifiedName: "Vehicle.Speed",
 *       type: "OBD_SIGNAL",
 *       interfaceId: "obd0",
 *       obdSignal: {
 *         pidResponseLength: 1,
 *         serviceMode: 1,
 *         pid: 13,
 *         scaling: 1,
 *         offset: 0,
 *         startByte: 0,
 *         byteLength: 1,
 *       },
 *     },
 *   ],
 *   status: "ACTIVE",
 * });
 * ```
 *
 * @resource
 */
export declare const DecoderManifest: import("../../Resource.ts").ResourceClass<DecoderManifest>;
export declare const DecoderManifestProvider: () => import("effect/Layer").Layer<Provider.Provider<DecoderManifest>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("@distilled.cloud/aws/Region").Region | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=DecoderManifest.d.ts.map