import * as Layer from "effect/Layer";
import { DestinationEventSource as IoTWirelessDestinationEventSource, type WirelessUplinkMessage } from "../IoTWireless/DestinationEventSource.ts";
import * as Lambda from "./Function.ts";
/**
 * An IoT Wireless uplink invocation — the envelope IoT Core for LoRaWAN
 * delivers to a destination's rule: the base64 `PayloadData` plus the
 * sending device's id.
 */
export declare const isWirelessUplinkMessage: (event: any) => event is WirelessUplinkMessage;
/**
 * Connects an IoT Wireless {@link Destination}'s uplink traffic to the
 * current Lambda function.
 *
 * At deploy time this layer creates the IoT topic rule named by the
 * destination's `expression` (the destination must use
 * `expressionType: "RuleName"`) with a Lambda action targeting this
 * function, and grants `iot.amazonaws.com` permission to invoke it; at
 * runtime it dispatches uplink invocations to the registered handler.
 * ### Consuming wireless uplinks
 * **Example:** Consume LoRaWAN uplinks
 * ```typescript
 * yield* IoTWireless.consumeUplinks(destination, (uplinks) =>
 *   uplinks.pipe(
 *     Stream.runForEach((uplink) => Effect.log(uplink.PayloadData)),
 *     Effect.orDie,
 *   ),
 * );
 * ```
 *
 * @binding
 */
export declare const WirelessDestinationEventSource: Layer.Layer<IoTWirelessDestinationEventSource, never, Lambda.Function>;
//# sourceMappingURL=WirelessDestinationEventSource.d.ts.map