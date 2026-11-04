import * as mediaconnect from "@distilled.cloud/aws/mediaconnect";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
declare const FlowOutputNameMissing_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "FlowOutputNameMissing";
} & Readonly<A>;
/**
 * Every flow output managed by alchemy must carry a `Name` so the reconciler
 * can converge outputs by identity across updates.
 */
export declare class FlowOutputNameMissing extends FlowOutputNameMissing_base<{
    message: string;
}> {
}
export interface FlowProps {
    /**
     * Name of the flow. If omitted, a deterministic physical name is generated
     * from the app, stage and logical ID. Changing the name replaces the flow
     * (MediaConnect has no rename operation).
     */
    flowName?: string;
    /**
     * Availability Zone the flow is created in. Must be within the current
     * region. Changing the Availability Zone replaces the flow.
     * @default MediaConnect picks an Availability Zone
     */
    availabilityZone?: string;
    /**
     * The source the flow ingests. Raw distilled `SetSourceRequest` shape —
     * e.g. `{ Protocol: "rtp", WhitelistCidr: "10.0.0.0/8", IngestPort: 5000 }`.
     * Mutable source settings (protocol, whitelist CIDR, ingest port, bitrate,
     * latency, stream id, sender address/port, description) are updated in
     * place via UpdateFlowSource.
     */
    source: mediaconnect.SetSourceRequest;
    /**
     * Outputs of the flow (up to 50). Each output MUST have a `Name` — the
     * reconciler converges outputs by name: missing outputs are added, extra
     * non-entitlement outputs are removed, and changed settings (destination,
     * port, protocol, CIDR allow list, latency, description) are updated in
     * place.
     * @default no outputs
     */
    outputs?: mediaconnect.AddOutputRequest[];
    /**
     * User-defined tags for the flow.
     */
    tags?: Record<string, string>;
}
export interface Flow extends Resource<"AWS.MediaConnect.Flow", FlowProps, {
    /** Name of the flow. */
    flowName: string;
    /** ARN of the flow. */
    flowArn: string;
    /** Current status — a freshly created flow is `STANDBY` (not billing for transport). */
    status: string;
    /** Availability Zone the flow runs in. */
    availabilityZone: string;
    /** Flow description, if any. */
    description: string | undefined;
    /** IP address the flow egresses media from. */
    egressIp: string | undefined;
    /** ARN of the flow's source. */
    sourceArn: string | undefined;
    /** IP address the flow listens on for incoming content. */
    sourceIngestIp: string | undefined;
    /** Port the flow listens on for incoming content. */
    sourceIngestPort: number | undefined;
    /** The flow's outputs (name, ARN, destination endpoint). */
    outputs: {
        name: string;
        outputArn: string;
        destination: string | undefined;
        port: number | undefined;
        listenerAddress: string | undefined;
    }[];
    /** Observed tags on the flow. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An AWS Elemental MediaConnect flow — a reliable live-video transport
 * between a source and one or more outputs.
 *
 * Creating a flow leaves it in `STANDBY`; a flow only ingests/egresses media
 * (and bills for transport) once started with the StartFlow API. Flows bill
 * hourly while ACTIVE, so alchemy never starts a flow implicitly.
 * ### Creating a Flow
 * **Example:** RTP Flow with a CIDR-Whitelisted Source
 * ```typescript
 * const flow = yield* Flow("Broadcast", {
 *   source: {
 *     Name: "primary",
 *     Protocol: "rtp",
 *     WhitelistCidr: "10.24.34.0/23",
 *     IngestPort: 5000,
 *   },
 * });
 * ```
 *
 * ### Outputs
 * **Example:** Flow with an RTP Output
 * ```typescript
 * const flow = yield* Flow("Distribution", {
 *   source: {
 *     Name: "primary",
 *     Protocol: "rtp",
 *     WhitelistCidr: "10.24.34.0/23",
 *     IngestPort: 5000,
 *   },
 *   outputs: [
 *     {
 *       Name: "affiliate-east",
 *       Protocol: "rtp",
 *       Destination: "198.51.100.11",
 *       Port: 5010,
 *     },
 *   ],
 * });
 * ```
 *
 * ### Tags
 * **Example:** Tagged Flow
 * ```typescript
 * const flow = yield* Flow("Broadcast", {
 *   source: { Protocol: "rtp", WhitelistCidr: "10.0.0.0/8", IngestPort: 5000 },
 *   tags: { team: "live-video" },
 * });
 * ```
 *
 * @resource
 */
export declare const Flow: import("../../Resource.ts").ResourceClass<Flow>;
export declare const FlowProvider: () => import("effect/Layer").Layer<Provider.Provider<Flow>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=Flow.d.ts.map