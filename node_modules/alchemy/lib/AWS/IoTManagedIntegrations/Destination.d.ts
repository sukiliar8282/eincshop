import * as mi from "@distilled.cloud/aws/iot-managed-integrations";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
export interface DestinationProps {
    /**
     * Name of the destination. If omitted, a unique name is generated from the
     * app, stage, and logical ID. Changing the name replaces the destination.
     */
    name?: string;
    /**
     * ARN of the delivery destination that receives events and notifications —
     * e.g. a Kinesis Data Stream ARN.
     */
    deliveryDestinationArn: string;
    /**
     * Type of the delivery destination.
     * @default "KINESIS"
     */
    deliveryDestinationType?: mi.DeliveryDestinationType;
    /**
     * ARN of the IAM role that grants Managed integrations permission to write
     * to the delivery destination.
     */
    roleArn: string;
    /**
     * Description of the destination.
     */
    description?: string;
    /**
     * User-defined tags to apply to the destination.
     */
    tags?: Record<string, string>;
}
export interface Destination extends Resource<"AWS.IoTManagedIntegrations.Destination", DestinationProps, {
    /** Name of the destination (its identifier). */
    destinationName: string;
    /** ARN of the delivery destination (e.g. Kinesis stream). */
    deliveryDestinationArn: string;
    /** Type of the delivery destination. */
    deliveryDestinationType: mi.DeliveryDestinationType;
    /** ARN of the IAM role used to deliver to the destination. */
    roleArn: string;
    /** Description of the destination. */
    description: string | undefined;
    /** Tags applied to the destination (user + internal). */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An AWS IoT Managed Integrations notification destination. Managed
 * integrations delivers lifecycle events and device notifications to the
 * destination (currently a Kinesis Data Stream) using the provided IAM role.
 *
 * IoT Managed Integrations is a regional service available in a limited set
 * of regions (e.g. `eu-west-1`, `ca-central-1`).
 *
 * ### Creating Destinations
 * **Example:** Kinesis Destination
 * ```typescript
 * const stream = yield* Kinesis.Stream("Events", {});
 * const role = yield* IAM.Role("DeliveryRole", {
 *   assumeRolePolicyDocument: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         Principal: { Service: "iotmanagedintegrations.amazonaws.com" },
 *         Action: ["sts:AssumeRole"],
 *       },
 *     ],
 *   },
 * });
 * const destination = yield* Destination("EventDestination", {
 *   deliveryDestinationArn: stream.streamArn,
 *   roleArn: role.roleArn,
 *   description: "Managed integrations device events",
 * });
 * ```
 *
 * @resource
 */
export declare const Destination: import("../../Resource.ts").ResourceClass<Destination>;
export declare const DestinationProvider: () => import("effect/Layer").Layer<Provider.Provider<Destination>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Destination.d.ts.map