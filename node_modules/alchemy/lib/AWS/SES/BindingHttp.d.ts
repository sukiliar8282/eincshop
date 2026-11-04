import * as Effect from "effect/Effect";
import type { ConfigurationSet } from "./ConfigurationSet.ts";
import type { EmailIdentity } from "./EmailIdentity.ts";
import type { EmailTemplate } from "./EmailTemplate.ts";
/**
 * Shared scaffolding for Amazon SES v2 HTTP bindings.
 *
 * NOT exported from `index.ts` — every thin `{Op}Http.ts` in this service is
 * a `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the builders
 * below. Everything except the operation, the IAM action list, and the
 * injected identifier is boilerplate.
 */
/**
 * Build the impl Effect for an account-level SES operation (account status,
 * account suppression list). These IAM actions do not support resource-level
 * permissions, so the deploy-time half grants `actions` on `*` and the
 * runtime callable passes the caller's request through as-is.
 */
export declare const makeSESHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.SES.GetAccount`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a template-scoped SES operation. The runtime
 * callable injects the bound {@link EmailTemplate}'s name as the request's
 * `TemplateName`; the deploy-time half grants `actions` on the template ARN.
 */
export declare const makeTemplateScopedHttpBinding: <I extends {
    TemplateName: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.SES.RenderEmailTemplate`. */
    tag: string;
    /** The distilled operation; `TemplateName` is injected from the resource. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the template ARN. */
    actions: readonly string[];
}) => Effect.Effect<(template: EmailTemplate) => Effect.Effect<(request: Omit<I, "TemplateName">) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * An SES identity referenced by address or domain, used ONLY to scope an IAM
 * grant.
 *
 * Unlike passing an {@link EmailIdentity} resource this creates no resource
 * edge and no ownership: nothing is created, adopted, or destroyed. That
 * matters when the identity is managed outside the stack — binding to a
 * resource would mean owning it, and owning it would mean `destroy` deleting
 * it.
 */
export interface EmailIdentityRef {
    /** The verified email address or domain, e.g. `"sender@example.com"`. */
    emailIdentity: string;
}
/**
 * Build the impl Effect for `SendCustomVerificationEmail`, scoped to the
 * identity being VERIFIED.
 *
 * Unlike the send bindings, SES authorizes this action against the identity
 * of the address in the request — the recipient the verification email starts
 * verification for — not against the template's FROM identity. Confirmed
 * live: a policy granting only the sender identity is refused with
 * "not authorized to perform: ses:SendCustomVerificationEmail on resource:
 * arn:aws:ses:<region>:<account>:identity/<RECIPIENT>".
 *
 * So the bound identity names what the function is allowed to verify: a
 * single address, or a domain, in which case addresses at that domain are
 * covered. That is the constraint worth enforcing — it stops a leaked binding
 * being used to send verification mail to arbitrary addresses.
 *
 * Accepts a managed {@link EmailIdentity} or an {@link EmailIdentityRef}; the
 * reference form derives the ARNs from the ambient account and region without
 * taking ownership. An optional {@link ConfigurationSet} is injected into the
 * request and added to the grant.
 */
export declare const makeVerificationScopedHttpBinding: <I extends {
    ConfigurationSetName?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.SES.SendCustomVerificationEmail`. */
    tag: string;
    /** The distilled operation. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the identity/address/template ARNs. */
    actions: readonly string[];
}) => Effect.Effect<(identity: EmailIdentity | EmailIdentityRef, configurationSet?: ConfigurationSet | undefined) => Effect.Effect<(request: Omit<I, "ConfigurationSetName">) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an identity-scoped send operation (`SendEmail`,
 * `SendBulkEmail`). The binding resolves the bound {@link EmailIdentity}
 * (and optional {@link ConfigurationSet}) and:
 *
 * - grants `actions` on the identity ARN, on addresses at the identity's
 *   domain (SES authorizes a send against the identity of the FROM address,
 *   not the domain identity ARN), on the account's templates (templated
 *   sends are authorized against the template resource), and on the
 *   configuration set ARN when one is bound;
 * - at runtime defaults `FromEmailAddress` to the identity and injects the
 *   bound configuration set's name.
 */
export declare const makeSendScopedHttpBinding: <I extends {
    FromEmailAddress?: string;
    ConfigurationSetName?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.SES.SendEmail`. */
    tag: string;
    /** The distilled send operation. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the identity/address/template/config-set ARNs. */
    actions: readonly string[];
}) => Effect.Effect<<Identity extends EmailIdentity>(identity: Identity, configurationSet?: ConfigurationSet | undefined) => Effect.Effect<(request: Omit<I, "ConfigurationSetName">) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map