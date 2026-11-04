import { consumeBusEvents, } from "../EventBridge/EventSource.js";
const DETAIL_TYPES = {
    "state-change": "ResourceGroups Group State Change",
    "membership-change": "ResourceGroups Group Membership Change",
};
/**
 * Event source connecting AWS Resource Groups group lifecycle events to
 * the hosting compute. When the account setting `GroupLifecycleEvents` is
 * `ACTIVE` (one-time opt-in via `UpdateAccountSettings`; check with the
 * {@link GetAccountSettings} binding), Resource Groups publishes group
 * state changes and membership changes to the account's default
 * EventBridge bus (source `aws.resource-groups`); this subscribes the host
 * Function to those events so it can react to resources entering or
 * leaving a group.
 *
 * Resource Groups publishes to EventBridge automatically once the account
 * setting is active — no additional resource is created besides the
 * EventBridge rule targeting the host. Provide the host-specific
 * implementation layer (e.g. `AWS.Lambda.EventSource`) on the Function
 * effect.
 *
 * ### Consuming Group Lifecycle Events
 * **Example:** React To Membership Changes
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default MembershipFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.ResourceGroups.consumeGroupEvents(
 *       { kinds: ["membership-change"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           Effect.log(
 *             `group ${event.detail.group?.name} membership changed`,
 *           ),
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeGroupEvents = (props, process) => consumeBusEvents(props.id ?? "ResourceGroupsGroupEvents", {
    source: ["aws.resource-groups"],
    "detail-type": (props.kinds ?? ["state-change", "membership-change"]).map((kind) => DETAIL_TYPES[kind]),
    ...(props.groupArns !== undefined
        ? { resources: [...props.groupArns] }
        : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=GroupEventSource.js.map