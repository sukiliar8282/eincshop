import * as workers from "@distilled.cloud/cloudflare/workers";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
const TypeId = "Cloudflare.Workers.Subdomain";
/**
 * The account-wide `workers.dev` subdomain singleton
 * (`/accounts/{account_id}/workers/subdomain`). Every Worker with
 * `workers.dev` enabled is served at
 * `https://<script>.<subdomain>.workers.dev`.
 *
 * Each account has at most one subdomain — "creating" this resource claims
 * (or renames to) the requested name. Subdomain names are globally unique
 * across all Cloudflare accounts; claiming a taken name fails with the
 * typed `SubdomainAlreadyExists` error.
 *
 * Destroy is capture-and-restore: the subdomain is renamed back to the
 * value it had before Alchemy first managed it. If the account had no
 * subdomain at first touch, destroy removes it entirely.
 *
 * **Warning:** renaming or removing the subdomain immediately changes the
 * URL of every deployed Worker on the account that relies on
 * `workers.dev`. Only manage this resource on accounts where that is
 * acceptable.
 * ### Managing the subdomain
 * **Example:** Pin the account's workers.dev subdomain
 * ```typescript
 * const sub = yield* Cloudflare.Workers.Subdomain("Subdomain", {
 *   subdomain: "my-team",
 * });
 * // Workers are now served from https://<script>.my-team.workers.dev
 * ```
 *
 * @see https://developers.cloudflare.com/workers/configuration/routing/workers-dev/
 *
 * @resource
 * @product Workers
 * @category Workers & Compute
 */
export const Subdomain = Resource(TypeId);
/**
 * Returns true if the given value is a Subdomain resource.
 */
export const isSubdomain = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const SubdomainProvider = () => Provider.succeed(Subdomain, {
    nuke: { singleton: true },
    stables: ["accountId", "initialSubdomain"],
    diff: Effect.fn(function* ({ output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // The singleton's identity is the account it lives on; the name
        // itself is renamed in place via PUT.
        if (output !== undefined && output.accountId !== accountId) {
            return { action: "replace" };
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        const observed = yield* getSubdomain(acct);
        if (observed === undefined)
            return undefined;
        // The subdomain is an account singleton — there is nothing to
        // "own", so a cold read adopts freely (never `Unowned`). The
        // observed name at adoption time becomes the `initialSubdomain`
        // restored on destroy.
        return {
            accountId: acct,
            subdomain: observed,
            initialSubdomain: output !== undefined ? output.initialSubdomain : observed,
        };
    }),
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // Account singleton — at most one workers.dev subdomain per account.
        // Mirror `read` with no prior output: the observed name is also the
        // `initialSubdomain`. Return a one-element array when registered, `[]`
        // when the account has never claimed a subdomain.
        const observed = yield* getSubdomain(accountId);
        if (observed === undefined)
            return [];
        return [
            {
                accountId,
                subdomain: observed,
                initialSubdomain: observed,
            },
        ];
    }),
    reconcile: Effect.fn(function* ({ news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // 1. Observe — read the account's live subdomain (undefined when
        //    the account has never registered one).
        const observed = yield* getSubdomain(accountId);
        // 2. Capture — the pre-management name, restored on destroy.
        //    `output` (including an adoption read) already carries it;
        //    otherwise this is our first touch and the observed name is
        //    the account's original (undefined = none existed).
        const initialSubdomain = output !== undefined ? output.initialSubdomain : observed;
        // 3. Sync — claim/rename only when the observed name differs.
        if (observed === news.subdomain) {
            return { accountId, subdomain: observed, initialSubdomain };
        }
        const updated = yield* workers.putSubdomain({
            accountId,
            subdomain: news.subdomain,
        });
        return { accountId, subdomain: updated.subdomain, initialSubdomain };
    }),
    delete: Effect.fn(function* ({ output }) {
        const { accountId, initialSubdomain } = output;
        // Observe — already gone (or never existed) means nothing to do.
        const observed = yield* getSubdomain(accountId);
        // Restore the pre-management name; skip the call when it already
        // matches (idempotent re-delete after a crashed run).
        if (observed === initialSubdomain)
            return;
        if (initialSubdomain === undefined) {
            // The account had no subdomain before we claimed one — remove it.
            yield* workers
                .deleteSubdomain({ accountId })
                .pipe(Effect.catchTag("SubdomainNotFound", () => Effect.void));
            return;
        }
        if (observed === undefined)
            return;
        yield* workers.putSubdomain({
            accountId,
            subdomain: initialSubdomain,
        });
    }),
});
/**
 * Read the account's workers.dev subdomain, mapping "no subdomain
 * registered" (`SubdomainNotFound`, HTTP 404) to `undefined`.
 */
const getSubdomain = (accountId) => workers.getSubdomain({ accountId }).pipe(Effect.map((r) => r.subdomain), Effect.catchTag("SubdomainNotFound", () => Effect.succeed(undefined)));
//# sourceMappingURL=Subdomain.js.map