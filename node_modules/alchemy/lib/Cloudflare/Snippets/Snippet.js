import * as snippets from "@distilled.cloud/cloudflare/snippets";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
import { listAllZones } from "../Zone/lookup.js";
/**
 * A Cloudflare Snippet — a lightweight JavaScript module that runs on
 * Cloudflare's edge to modify HTTP traffic for a zone.
 *
 * Uploading a snippet does not activate it: traffic only flows through a
 * snippet once a {@link SnippetRules} rule references it with a matching
 * expression.
 *
 * Safety: snippets carry no ownership markers. When there is no prior
 * state, `read` looks the snippet up by name and reports an existing match
 * as `Unowned`, so the engine refuses to take it over unless `--adopt`
 * (or `adopt(true)`) is set.
 * ### Creating a Snippet
 * **Example:** Add a response header
 * ```typescript
 * const snippet = yield* Cloudflare.Snippets.Snippet("HeaderSnippet", {
 *   zoneId: zone.zoneId,
 *   code: `
 *     export default {
 *       async fetch(request) {
 *         const response = await fetch(request);
 *         const headers = new Headers(response.headers);
 *         headers.set("x-snippet", "hello");
 *         return new Response(response.body, { ...response, headers });
 *       },
 *     };
 *   `,
 * });
 * ```
 *
 * ### Activating with Snippet Rules
 * **Example:** Route traffic through the snippet
 * ```typescript
 * yield* Cloudflare.Snippets.SnippetRules("Rules", {
 *   zoneId: zone.zoneId,
 *   rules: [
 *     {
 *       snippetName: snippet.name,
 *       expression: 'http.request.uri.path wildcard "/api/*"',
 *     },
 *   ],
 * });
 * ```
 *
 * @resource
 * @product Snippets
 * @category Rules & Configuration
 */
export const Snippet = Resource("Cloudflare.Snippets.Snippet");
export const isSnippet = (value) => Predicate.hasProperty(value, "Type") &&
    value.Type === "Cloudflare.Snippets.Snippet";
const DEFAULT_MAIN_MODULE = "snippet.js";
export const SnippetProvider = () => Provider.succeed(Snippet, {
    stables: ["name", "zoneId", "createdOn"],
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // Snippets live inside a zone with no account-wide enumeration
        // API — fan out across every zone and list snippets per zone.
        const zones = yield* listAllZones(accountId);
        const rows = yield* Effect.forEach(zones, (zone) => snippets.listSnippets.pages({ zoneId: zone.id }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? []).map((s) => ({
            name: s.snippetName,
            zoneId: zone.id,
            // The list response carries no main module; snippets
            // upload under the engine default and `read` falls
            // back to it too, so report the same here.
            mainModule: DEFAULT_MAIN_MODULE,
            createdOn: s.createdOn,
            modifiedOn: s.modifiedOn ?? undefined,
        })))), 
        // Plan-gated / partial-permission zones reject the route; skip.
        Effect.catchTag("Forbidden", () => Effect.succeed([]))), { concurrency: 10 });
        return rows.flat();
    }),
    diff: Effect.fn(function* ({ id, olds, news, output }) {
        if (!isResolved(news))
            return undefined;
        const o = olds;
        const n = news;
        // Name is the snippet's identity within the zone.
        const oldName = output?.name ?? (yield* createSnippetName(id, o.name));
        // Auto-generated names are engine-owned: the deployed name stays
        // authoritative even if the generator would name this id differently
        // today. Only an explicit user-provided name can force a replace.
        const name = n.name ?? oldName;
        if (oldName !== name) {
            return { action: "replace" };
        }
        // zoneId is Input<string>; only compare once both are concrete.
        const oldZoneId = output?.zoneId ?? (typeof o.zoneId === "string" ? o.zoneId : undefined);
        if (typeof n.zoneId === "string" &&
            oldZoneId !== undefined &&
            oldZoneId !== n.zoneId) {
            return { action: "replace" };
        }
    }),
    read: Effect.fn(function* ({ id, olds, output }) {
        // Owned path: refresh from persisted identity.
        if (output?.name && output.zoneId) {
            const observed = yield* getSnippetOrUndefined(output.zoneId, output.name);
            if (observed) {
                return toAttributes(observed, output.zoneId, output.mainModule);
            }
            return undefined;
        }
        // Cold read: derive the deterministic name and look it up. Snippets
        // carry no ownership markers, so an existing match is `Unowned` and
        // takeover is gated behind the adopt policy.
        const zoneId = output?.zoneId ?? olds?.zoneId;
        if (!zoneId)
            return undefined;
        const name = output?.name ?? (yield* createSnippetName(id, olds?.name));
        const observed = yield* getSnippetOrUndefined(zoneId, name);
        if (observed) {
            return Unowned(toAttributes(observed, zoneId, olds?.mainModule ?? DEFAULT_MAIN_MODULE));
        }
        return undefined;
    }),
    reconcile: Effect.fn(function* ({ id, news, output }) {
        // Inputs have been resolved to concrete values by Plan.
        const zoneId = (output?.zoneId ?? news.zoneId);
        const name = output?.name ?? (yield* createSnippetName(id, news.name));
        const mainModule = news.mainModule ?? DEFAULT_MAIN_MODULE;
        // `putSnippet` (PUT) is a true upsert — one call converges greenfield
        // create, routine update, and adoption alike.
        const file = yield* Effect.sync(() => new File([news.code], mainModule, {
            type: "application/javascript+module",
        }));
        const synced = yield* snippets.putSnippet({
            zoneId,
            snippetName: name,
            metadata: { mainModule },
            files: file,
        });
        return toAttributes(synced, zoneId, mainModule);
    }),
    delete: Effect.fn(function* ({ output }) {
        yield* snippets
            .deleteSnippet({
            zoneId: output.zoneId,
            snippetName: output.name,
        })
            // A snippet can only be deleted once no snippet rule references it.
            // The engine deletes referencing `SnippetRules` first (dependency
            // edge via `snippetName`), but the rule removal is eventually
            // consistent — Cloudflare may still report `snippet is still used`
            // for a short window. Bounded-retry that lag before giving up.
            .pipe(Effect.retry({
            while: (e) => e._tag === "SnippetInUse",
            schedule: Schedule.max([
                Schedule.exponential("1 second"),
                Schedule.recurs(8),
            ]),
        }), Effect.catchTag("SnippetNotFound", () => Effect.void));
    }),
});
/**
 * Snippet names only allow letters, numbers, and underscores; physical
 * names are generated with `_` separators and any residual hyphens (from
 * the app/stage/id) are normalized to underscores.
 */
const createSnippetName = (id, name) => Effect.gen(function* () {
    if (name)
        return name;
    const physical = yield* createPhysicalName({
        id,
        lowercase: true,
        delimiter: "_",
    });
    return physical.replaceAll("-", "_");
});
const getSnippetOrUndefined = (zoneId, snippetName) => snippets
    .getSnippet({ zoneId, snippetName })
    .pipe(Effect.catchTag("SnippetNotFound", () => Effect.succeed(undefined)));
const toAttributes = (observed, zoneId, mainModule) => ({
    name: observed.snippetName,
    zoneId,
    mainModule,
    createdOn: observed.createdOn,
    modifiedOn: observed.modifiedOn ?? undefined,
});
//# sourceMappingURL=Snippet.js.map