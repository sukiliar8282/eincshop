import * as contacts from "@distilled.cloud/aws/notificationscontacts";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as Redacted from "effect/Redacted";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags } from "../../Tags.js";
/**
 * An AWS User Notifications Contacts **email contact** — an email address
 * that can be attached to a notification configuration as a delivery
 * channel.
 *
 * Contacts are created in the unverified `inactive` state; activation is a
 * human email-confirmation loop (AWS emails the address a confirmation
 * link), so Alchemy provisions the contact and leaves activation to the
 * address owner. Contacts are immutable (no update API) — changing the
 * name or address replaces the contact; tags update in place.
 *
 * ### Creating an Email Contact
 * **Example:** Basic email contact
 * ```typescript
 * import * as NotificationsContacts from "alchemy/AWS/NotificationsContacts";
 *
 * const contact = yield* NotificationsContacts.EmailContact("OnCall", {
 *   emailAddress: "oncall@example.com",
 * });
 * // contact.status === "inactive" until the address owner confirms
 * ```
 *
 * **Example:** Named contact with tags
 * ```typescript
 * const contact = yield* NotificationsContacts.EmailContact("OnCall", {
 *   name: "platform-oncall",
 *   emailAddress: "oncall@example.com",
 *   tags: { team: "platform" },
 * });
 * ```
 *
 * @resource
 */
export const EmailContact = Resource("AWS.NotificationsContacts.EmailContact");
/** Unwrap distilled `SensitiveString` values into plain strings. */
const unwrapSensitive = (value) => typeof value === "string" ? value : Redacted.value(value);
const readContactTags = Effect.fn(function* (arn) {
    return yield* contacts.listTagsForResource({ arn }).pipe(Effect.map((r) => (r.tags ?? {})), Effect.catchTag(["ResourceNotFoundException", "ValidationException"], () => Effect.succeed({})));
});
const syncContactTags = Effect.fn(function* (arn, id, userTags) {
    const internalTags = yield* createInternalTags(id);
    const desired = { ...userTags, ...internalTags };
    const observed = yield* readContactTags(arn);
    const { upsert, removed } = diffTags(observed, desired);
    if (upsert.length > 0) {
        yield* contacts.tagResource({
            arn,
            tags: Object.fromEntries(upsert.map((t) => [t.Key, t.Value])),
        });
    }
    if (removed.length > 0) {
        yield* contacts.untagResource({ arn, tagKeys: removed });
    }
});
export const EmailContactProvider = () => Provider.effect(EmailContact, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return props.name ?? (yield* createPhysicalName({ id }));
    });
    // Email addresses are unique account-wide (CreateEmailContact rejects
    // duplicates with ConflictException), so an address scan is a
    // reliable identity fallback when the ARN cache is missing.
    const findByAddress = Effect.fn(function* (emailAddress) {
        return yield* contacts.listEmailContacts.items({}).pipe(Stream.filter((contact) => unwrapSensitive(contact.address) === emailAddress), Stream.runHead, Effect.map(Option.getOrUndefined));
    });
    const getByArn = Effect.fn(function* (arn) {
        return yield* contacts.getEmailContact({ arn }).pipe(Effect.map((r) => r.emailContact), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    });
    const toAttrs = (live) => ({
        emailContactArn: live.arn,
        name: unwrapSensitive(live.name),
        emailAddress: unwrapSensitive(live.address),
        status: live.status,
    });
    return EmailContact.Provider.of({
        stables: ["emailContactArn", "name", "emailAddress"],
        list: () => contacts.listEmailContacts.items({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).map(toAttrs))),
        read: Effect.fn(function* ({ id, olds, output }) {
            const found = output?.emailContactArn
                ? yield* getByArn(output.emailContactArn)
                : olds?.emailAddress
                    ? yield* findByAddress(olds.emailAddress)
                    : undefined;
            if (!found)
                return undefined;
            const attrs = toAttrs(found);
            const tags = yield* readContactTags(found.arn);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            const oldName = yield* createName(id, olds);
            const newName = yield* createName(id, news);
            // No update API — any change to the contact itself replaces it.
            if (oldName !== newName || news.emailAddress !== olds.emailAddress) {
                return { action: "replace" };
            }
            return undefined;
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const name = yield* createName(id, news);
            // OBSERVE — cloud state is authoritative; the cached ARN falls
            // through to an address scan when it no longer resolves.
            let live = output?.emailContactArn
                ? yield* getByArn(output.emailContactArn)
                : yield* findByAddress(news.emailAddress);
            // ENSURE — create when missing; ConflictException means a
            // same-address contact already exists (race) → re-observe.
            if (live === undefined) {
                const created = yield* contacts
                    .createEmailContact({
                    name,
                    emailAddress: news.emailAddress,
                    tags: news.tags,
                })
                    .pipe(Effect.catchTag("ConflictException", () => Effect.succeed(undefined)));
                live = created
                    ? yield* getByArn(created.arn)
                    : yield* findByAddress(news.emailAddress);
            }
            const arn = live.arn;
            // SYNC tags — the contact itself is immutable; tags are the only
            // mutable aspect (diffed against observed cloud tags).
            yield* syncContactTags(arn, id, news.tags);
            yield* session.note(arn);
            return toAttrs(live);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* contacts
                .deleteEmailContact({ arn: output.emailContactArn })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    });
}));
//# sourceMappingURL=EmailContact.js.map