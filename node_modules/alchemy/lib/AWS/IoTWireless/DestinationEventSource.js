import * as Binding from "../../Binding.js";
export const DestinationEventSource = Binding.Service("AWS.IoTWireless.DestinationEventSource");
/**
 * Invoke an Effect handler for every uplink message routed through the
 * destination, by creating the IoT rule the destination's `expression`
 * names with a Lambda action targeting the current function.
 *
 * Provide `Lambda.WirelessDestinationEventSource` on the hosting function
 * to satisfy the requirement.
 *
 * @param destination The `RuleName` destination whose uplinks to consume.
 * @param process The handler invoked with a stream of uplink messages.
 *
 * @example Store uplinks in DynamoDB
 * ```typescript
 * yield* IoTWireless.consumeUplinks(destination, (uplinks) =>
 *   uplinks.pipe(
 *     Stream.runForEach((uplink) =>
 *       putItem({ Item: { pk: { S: uplink.WirelessDeviceId } } }),
 *     ),
 *     Effect.orDie,
 *   ),
 * );
 * ```
 */
export function consumeUplinks(destination, process) {
    return DestinationEventSource.use((source) => source(destination, process));
}
//# sourceMappingURL=DestinationEventSource.js.map