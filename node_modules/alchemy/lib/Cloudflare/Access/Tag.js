import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
/**
 * A Cloudflare Zero Trust Access tag. Tags are plain labels that can be
 * attached to Access applications to group and filter them.
 *
 * The tag's name is its identity — there is nothing to update in place, so
 * renaming replaces the tag.
 * ### Creating a Tag
 * **Example:** Tag with a generated name
 * ```typescript
 * const tag = yield* Cloudflare.Access.Tag("Team", {});
 * ```
 *
 * **Example:** Tag with an explicit name
 * ```typescript
 * const tag = yield* Cloudflare.Access.Tag("Team", {
 *   name: "platform-team",
 * });
 * ```
 *
 * ### Tagging an Application
 * **Example:** Reference from an Access application
 * ```typescript
 * const tag = yield* Cloudflare.Access.Tag("Team", { name: "platform-team" });
 *
 * const app = yield* Cloudflare.Access.Application("Dashboard", {
 *   type: "self_hosted",
 *   domain: "dash.example.com",
 *   tags: [tag.name],
 * });
 * ```
 *
 * @resource
 * @product Access
 * @category Cloudflare One (Zero Trust)
 */
export const Tag = Resource("Cloudflare.Access.Tag");
export const isTag = (value) => Predicate.hasProperty(value, "Type") &&
    value.Type === "Cloudflare.Access.Tag";
export const TagProvider = () => Provider.succeed(Tag, {
    stables: ["name", "accountId"],
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        return yield* zeroTrust.listAccessTags.pages({ accountId }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? []).map((tag) => ({
            name: tag.name,
            accountId,
        })))));
    }),
    diff: Effect.fn(function* ({ news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        if (!isResolved(news))
            return undefined;
        if ((output?.accountId ?? accountId) !== accountId) {
            return { action: "replace" };
        }
        // The name is the identity — an explicit rename is a replacement.
        if (output && news.name !== undefined && news.name !== output.name) {
            return { action: "replace" };
        }
    }),
    read: Effect.fn(function* ({ id, output, olds }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        const name = yield* createTagName(id, output?.name ?? olds?.name);
        const existing = yield* zeroTrust
            .getAccessTag({ accountId: acct, tagName: name })
            .pipe(Effect.catchTag("AccessTagNotFound", () => Effect.succeed(undefined)));
        if (!existing)
            return undefined;
        return { name: existing.name, accountId: acct };
    }),
    reconcile: Effect.fn(function* ({ id, news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        const name = yield* createTagName(id, news.name);
        // Observe — the name is the identity, so existence is the only state.
        const observed = yield* zeroTrust
            .getAccessTag({ accountId: acct, tagName: name })
            .pipe(Effect.catchTag("AccessTagNotFound", () => Effect.succeed(undefined)));
        // Ensure — create when missing; a create race resolves to the same tag.
        if (!observed) {
            const created = yield* zeroTrust
                .createAccessTag({ accountId: acct, name })
                .pipe(Effect.catch((err) => zeroTrust
                .getAccessTag({ accountId: acct, tagName: name })
                .pipe(Effect.catchTag("AccessTagNotFound", () => Effect.fail(err)))));
            return { name: created.name, accountId: acct };
        }
        return { name: observed.name, accountId: acct };
    }),
    delete: Effect.fn(function* ({ output }) {
        yield* zeroTrust
            .deleteAccessTag({ accountId: output.accountId, tagName: output.name })
            .pipe(Effect.catchTag("AccessTagNotFound", () => Effect.void));
    }),
});
const createTagName = (id, name) => Effect.gen(function* () {
    if (name)
        return name;
    // Tag names are capped at 35 characters by the Cloudflare API.
    return yield* createPhysicalName({ id, maxLength: 35, suffixLength: 12 });
});
//# sourceMappingURL=Tag.js.map