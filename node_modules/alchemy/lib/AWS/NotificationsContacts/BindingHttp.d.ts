import * as Effect from "effect/Effect";
import { Region } from "../Region.ts";
import type { EmailContact } from "./EmailContact.ts";
/**
 * Build the impl Effect for a User Notifications Contacts operation scoped
 * to one {@link EmailContact}: the deploy-time half grants `actions` on the
 * bound contact's ARN, and the runtime half injects the contact's ARN as
 * the `arn` of every request.
 */
export declare const makeEmailContactHttpBinding: <I extends {
    arn: string;
}, A, E, R, Req = Omit<I, "arn">>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.NotificationsContacts.SendActivationCode`. */
    tag: string;
    /** The distilled operation. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the email contact ARN. */
    actions: readonly string[];
}) => Effect.Effect<(contact: EmailContact) => Effect.Effect<(request?: Req | undefined) => Effect.Effect<A, E, never>, never, never>, never, Exclude<R, Region>>;
//# sourceMappingURL=BindingHttp.d.ts.map