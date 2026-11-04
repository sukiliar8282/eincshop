import * as iotw from "@distilled.cloud/aws/iot-wireless";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface DestinationProps {
    /**
     * Name of the destination. Names are unique per account/region and may
     * contain only alphanumerics, dashes, and underscores. If omitted, a
     * deterministic physical name is generated. Changing the name replaces
     * the destination.
     */
    name?: string;
    /**
     * How `expression` is interpreted: `RuleName` routes uplinks to an AWS
     * IoT rule; `MqttTopic` publishes them to an MQTT topic.
     */
    expressionType: iotw.ExpressionType;
    /**
     * The IoT rule name or MQTT topic uplink messages are routed to. The
     * referenced rule does not need to exist when the destination is created.
     */
    expression: string;
    /**
     * Human-readable description of the destination.
     */
    description?: string;
    /**
     * ARN of the IAM role IoT Wireless assumes to deliver messages to the
     * rule or topic. The role's trust policy must allow
     * `iotwireless.amazonaws.com` to assume it.
     */
    roleArn: string;
    /**
     * Tags applied to the destination. Alchemy ownership tags are merged in
     * automatically.
     */
    tags?: Record<string, string>;
}
export interface Destination extends Resource<"AWS.IoTWireless.Destination", DestinationProps, {
    /** Name of the destination (its unique identifier). */
    destinationName: string;
    /** ARN of the destination. */
    destinationArn: string;
    /** How the expression is interpreted (`RuleName` or `MqttTopic`). */
    expressionType: iotw.ExpressionType;
    /** The IoT rule name or MQTT topic uplinks are routed to. */
    expression: string;
    /** ARN of the delivery IAM role. */
    roleArn: string;
}, never, Providers> {
}
/**
 * An AWS IoT Core for LoRaWAN destination — the routing rule that delivers
 * uplink messages from wireless devices to an AWS IoT rule or MQTT topic.
 *
 * The destination name is its identity (changing it replaces the
 * destination); the expression, expression type, description, role, and
 * tags all update in place.
 * ### Creating Destinations
 * **Example:** Route uplinks to an IoT rule
 * ```typescript
 * import * as IoTWireless from "alchemy/AWS/IoTWireless";
 *
 * const destination = yield* IoTWireless.Destination("Uplinks", {
 *   expressionType: "RuleName",
 *   expression: "process_sensor_uplinks",
 *   roleArn: deliveryRole.roleArn,
 * });
 * ```
 *
 * **Example:** Publish uplinks straight to an MQTT topic
 * ```typescript
 * const destination = yield* IoTWireless.Destination("Uplinks", {
 *   expressionType: "MqttTopic",
 *   expression: "sensors/uplinks",
 *   roleArn: deliveryRole.roleArn,
 * });
 * ```
 *
 * ### Delivery Role
 * **Example:** IAM role IoT Wireless assumes for delivery
 * ```typescript
 * const deliveryRole = yield* IAM.Role("IotWirelessDelivery", {
 *   assumeRolePolicyDocument: {
 *     Version: "2012-10-17",
 *     Statement: [{
 *       Effect: "Allow",
 *       Principal: { Service: "iotwireless.amazonaws.com" },
 *       Action: ["sts:AssumeRole"],
 *     }],
 *   },
 *   policies: [{
 *     policyName: "deliver",
 *     policyDocument: {
 *       Version: "2012-10-17",
 *       Statement: [{
 *         Effect: "Allow",
 *         Action: ["iot:DescribeEndpoint", "iot:Publish"],
 *         Resource: ["*"],
 *       }],
 *     },
 *   }],
 * });
 * ```
 *
 * ### Consuming Uplinks in a Function
 * Uplinks are delivered through AWS IoT Core. For a `RuleName` destination,
 * `IoTWireless.consumeUplinks` (see {@link DestinationEventSource}) creates
 * the named IoT rule targeting the current Lambda and invokes the handler
 * for every uplink. Alternatively, point an `MqttTopic` destination at a
 * topic and consume it with `AWS.IoT.consumeTopicMessages`.
 * **Example:** Route Device Uplinks into a Lambda
 * ```typescript
 * const destination = yield* IoTWireless.Destination("Uplinks", {
 *   expressionType: "RuleName",
 *   expression: "sensor_uplinks",
 *   roleArn: deliveryRole.roleArn,
 * });
 *
 * // inside the Function effect (provide Lambda.WirelessDestinationEventSource):
 * yield* IoTWireless.consumeUplinks(destination, (uplinks) =>
 *   uplinks.pipe(
 *     Stream.runForEach((uplink) => processUplink(uplink)),
 *     Effect.orDie,
 *   ),
 * );
 * ```
 *
 * @resource
 */
export declare const Destination: import("../../Resource.ts").ResourceClass<Destination>;
export declare const DestinationProvider: () => import("effect/Layer").Layer<Provider.Provider<Destination>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Destination.d.ts.map