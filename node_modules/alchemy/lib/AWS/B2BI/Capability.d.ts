import * as b2bi from "@distilled.cloud/aws/b2bi";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface CapabilityProps {
    /**
     * The name of the capability.
     */
    name: string;
    /**
     * The type of the capability. EDI is the only supported type today.
     * @default "edi"
     */
    type?: "edi";
    /**
     * The capability configuration. For EDI capabilities this describes the
     * X12 transaction set, direction, transformer, and the input/output S3
     * locations. `configuration.edi.transformerId` may reference a
     * {@link Transformer}'s `transformerId` output.
     */
    configuration: b2bi.CapabilityConfiguration;
    /**
     * S3 locations of instruction documents (implementation guides) attached
     * to the capability.
     */
    instructionsDocuments?: b2bi.S3Location[];
    /**
     * User-defined tags for the capability.
     */
    tags?: Record<string, string>;
}
export interface Capability extends Resource<"AWS.B2BI.Capability", CapabilityProps, {
    /**
     * Service-assigned unique ID of the capability.
     */
    capabilityId: string;
    /**
     * ARN of the capability.
     */
    capabilityArn: string;
    /**
     * Name of the capability.
     */
    name: string;
    /**
     * Capability type (`edi`).
     */
    type: string;
}, never, Providers> {
}
/**
 * An AWS B2B Data Interchange (B2BI) capability. A capability contains the
 * information required to transform incoming or outgoing EDI documents: the
 * X12 transaction set, a transformer, and the S3 input/output locations.
 * ### Creating a Capability
 * **Example:** Inbound X12 850 Capability
 * ```typescript
 * const capability = yield* B2BI.Capability("Orders", {
 *   name: "inbound-orders",
 *   configuration: {
 *     edi: {
 *       capabilityDirection: "INBOUND",
 *       type: { x12Details: { transactionSet: "X12_850", version: "VERSION_4010" } },
 *       inputLocation: { bucketName: bucket.bucketName, key: "inbound/" },
 *       outputLocation: { bucketName: bucket.bucketName, key: "processed/" },
 *       transformerId: transformer.transformerId,
 *     },
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Capability: import("../../Resource.ts").ResourceClass<Capability>;
export declare const CapabilityProvider: () => import("effect/Layer").Layer<Provider.Provider<Capability>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Capability.d.ts.map