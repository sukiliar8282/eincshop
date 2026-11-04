/**
 * Shared scaffolding for the Incident Manager Contacts (SSM Contacts) HTTP
 * bindings.
 *
 * NOT exported from `index.ts` — every thin `{Op}Http.ts` in this service is
 * a `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the builders
 * below. Everything except the operation and the IAM action list is
 * boilerplate:
 *
 * - Contact-scoped operations (`ssm-contacts:StartEngagement`,
 *   `ssm-contacts:ListPagesByContact`) inject the bound {@link Contact}'s
 *   ARN as the request's `ContactId` and are granted on the contact ARN.
 * - Channel-scoped operations (`ssm-contacts:ActivateContactChannel`, …)
 *   inject the bound {@link ContactChannel}'s ARN as `ContactChannelId` and
 *   are granted on the channel ARN.
 * - Rotation-scoped operations (`ssm-contacts:ListRotationShifts`, rotation
 *   overrides) inject the bound {@link Rotation}'s ARN as `RotationId` and
 *   are granted on the rotation ARN.
 * - Account-level operations (engagement / page reads and controls) take
 *   the caller's request as-is and are granted on `*` — engagement and page
 *   ARNs are minted at runtime and cannot be scoped statically.
 */
import * as Effect from "effect/Effect";
import type { Contact } from "./Contact.ts";
import type { ContactChannel } from "./ContactChannel.ts";
import type { Rotation } from "./Rotation.ts";
/**
 * Build the impl Effect for an SSM Contacts operation scoped to a
 * {@link Contact}: the deploy-time half grants `actions` on the bound
 * contact's ARN, and the runtime half injects the contact's ARN as the
 * request's `ContactId` field.
 */
export declare const makeContactHttpBinding: <I extends {
    ContactId: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.SSMContacts.StartEngagement`. */
    tag: string;
    /** The distilled operation; `ContactId` is injected from the contact. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the contact ARN. */
    actions: readonly string[];
}) => Effect.Effect<(contact: Contact) => Effect.Effect<(request?: Omit<I, "ContactId"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an SSM Contacts operation scoped to a
 * {@link ContactChannel}: the deploy-time half grants `actions` on the bound
 * channel's ARN, and the runtime half injects the channel's ARN as the
 * request's `ContactChannelId` field.
 */
export declare const makeContactChannelHttpBinding: <I extends {
    ContactChannelId: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.SSMContacts.SendActivationCode`. */
    tag: string;
    /** The distilled operation; `ContactChannelId` is injected from the channel. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the contact channel ARN. */
    actions: readonly string[];
}) => Effect.Effect<(channel: ContactChannel) => Effect.Effect<(request?: Omit<I, "ContactChannelId"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an SSM Contacts operation scoped to a
 * {@link Rotation}: the deploy-time half grants `actions` on the bound
 * rotation's ARN, and the runtime half injects the rotation's ARN as the
 * request's `RotationId` field.
 */
export declare const makeRotationHttpBinding: <I extends {
    RotationId: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.SSMContacts.ListRotationShifts`. */
    tag: string;
    /** The distilled operation; `RotationId` is injected from the rotation. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the rotation ARN. */
    actions: readonly string[];
}) => Effect.Effect<(rotation: Rotation) => Effect.Effect<(request?: Omit<I, "RotationId"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an account-level SSM Contacts operation
 * (engagement and page reads/controls). The deploy-time half grants
 * `actions` on `*` — engagement and page ARNs embed runtime-generated ids
 * and cannot be scoped to a deployed resource.
 */
export declare const makeAccountHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.SSMContacts.StopEngagement`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map