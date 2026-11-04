import * as speed from "@distilled.cloud/cloudflare/speed";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
import { listAllZones } from "../Zone/lookup.js";
const TypeId = "Cloudflare.Speed.TestSchedule";
/**
 * A recurring Cloudflare Observatory (Speed) test schedule — Cloudflare runs
 * a Lighthouse test against a page on your zone on a `DAILY` or `WEEKLY`
 * cadence from a region of your choice.
 *
 * A schedule's identity is the `(zoneId, url, region)` triple: the API keys
 * schedules per URL and region, rejects duplicates, and has no update call.
 * Changing `url`, `region`, or `zoneId` therefore replaces the schedule,
 * while a `frequency` change is converged in place (delete + re-create under
 * the same identity). Creating a schedule implicitly enqueues an initial
 * test run.
 *
 * Plan quota applies: the number of allowed schedules per zone depends on
 * the zone's plan (e.g. 5 on Free/Pro) — see the Observatory availabilities
 * endpoint for the zone's remaining quota.
 *
 * Safety: schedules carry no ownership markers. When there is no prior
 * state, `read` reports an existing schedule for the same `(url, region)` as
 * `Unowned`, so the engine refuses to take it over unless `--adopt` (or
 * `adopt(true)`) is set.
 * ### Scheduling a test
 * **Example:** Weekly test of the home page
 * ```typescript
 * yield* Cloudflare.Speed.TestSchedule("HomePageSpeed", {
 *   zoneId: zone.zoneId,
 *   url: "example.com/",
 *   frequency: "WEEKLY",
 * });
 * ```
 *
 * **Example:** Daily test of a specific page from Europe
 * ```typescript
 * yield* Cloudflare.Speed.TestSchedule("PricingSpeedEU", {
 *   zoneId: zone.zoneId,
 *   url: "example.com/pricing",
 *   region: "europe-west2",
 *   frequency: "DAILY",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/speed/speed-test/
 *
 * @resource
 * @product Speed
 * @category Performance & Reliability
 */
export const TestSchedule = Resource(TypeId);
/**
 * Returns true if the given value is a TestSchedule resource.
 */
export const isTestSchedule = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
const DEFAULT_REGION = "us-central1";
/**
 * Cloudflare normalizes schedule URLs: the scheme is dropped and a bare
 * hostname gains a trailing slash (`example.com` -> `example.com/`). Apply
 * the same normalization locally so `diff` doesn't flag a replacement for a
 * cosmetic respelling of the same page.
 */
const normalizeUrl = (url) => {
    const stripped = url.replace(/^https?:\/\//, "");
    return stripped.includes("/") ? stripped : `${stripped}/`;
};
export const TestScheduleProvider = () => Provider.succeed(TestSchedule, {
    stables: ["zoneId", "url", "region"],
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // Schedules live inside a zone and are keyed per `(url, region)` —
        // there is no account-wide enumeration API. Fan out over every zone,
        // enumerate the zone's Observatory pages, and resolve each page's
        // schedule with the exact `(url, region)` keying `read` uses.
        const zones = yield* listAllZones(accountId);
        const rows = yield* Effect.forEach(zones, (zone) => speed.listPages.pages({ zoneId: zone.id }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? []).flatMap((p) => p.url
            ? [
                {
                    url: p.url,
                    region: p.region?.value ??
                        DEFAULT_REGION,
                },
            ]
            : []))), Effect.flatMap((pages) => Effect.forEach(pages, ({ url, region }) => getSchedule(zone.id, url, region).pipe(Effect.map((observed) => observed
            ? toAttributes(observed, zone.id, url, region)
            : undefined), 
        // Plan-gated zone rejects the schedule route; skip it.
        Effect.catchTag("Forbidden", () => Effect.succeed(undefined))), { concurrency: 10 })), Effect.map((items) => items.filter((item) => item !== undefined)), 
        // Plan-gated / partial zones reject the pages route; skip them.
        Effect.catchTag("InvalidRoute", () => Effect.succeed([]))), { concurrency: 10 });
        return rows.flat();
    }),
    diff: Effect.fn(function* ({ olds, news }) {
        const o = olds;
        const n = news;
        // No prior props to compare against — let the engine decide.
        if (o?.url === undefined)
            return undefined;
        // The URL is the schedule's path identity.
        if (normalizeUrl(o.url) !== normalizeUrl(n.url)) {
            return { action: "replace" };
        }
        // Schedules are keyed per region — a region change is a new schedule.
        if ((o.region ?? DEFAULT_REGION) !== (n.region ?? DEFAULT_REGION)) {
            return { action: "replace" };
        }
        // zoneId is Input<string>; compare only once both are concrete.
        if (typeof o.zoneId === "string" &&
            typeof n.zoneId === "string" &&
            o.zoneId !== n.zoneId) {
            return { action: "replace" };
        }
        // frequency converges in place (reconcile deletes + re-creates).
        return undefined;
    }),
    read: Effect.fn(function* ({ output, olds }) {
        const zoneId = output?.zoneId ?? olds?.zoneId;
        const url = output?.url ?? olds?.url;
        const region = output?.region ?? olds?.region ?? DEFAULT_REGION;
        if (!zoneId || !url)
            return undefined;
        const observed = yield* getSchedule(zoneId, url, region);
        if (!observed)
            return undefined;
        const attrs = toAttributes(observed, zoneId, url, region);
        // Owned path: we have persisted state for this schedule.
        if (output)
            return attrs;
        // Adoption path: a schedule for this `(url, region)` already exists
        // but schedules carry no ownership markers, so we cannot prove we
        // created it — brand it `Unowned` so the engine refuses to take over
        // unless `adopt` is set.
        return Unowned(attrs);
    }),
    reconcile: Effect.fn(function* ({ news }) {
        // Inputs have been resolved to concrete strings by Plan.
        const zoneId = news.zoneId;
        const region = news.region ?? DEFAULT_REGION;
        // 1. Observe — cloud state is authoritative. `output` is only a cache
        //    of the stable identity, which `news` fully determines anyway.
        let observed = yield* getSchedule(zoneId, news.url, region);
        // 2. Ensure — create when missing. A concurrent create surfaces as
        //    `TestScheduleAlreadyExists`: converge by re-reading the schedule
        //    that won the race.
        if (!observed) {
            observed = yield* createAndObserve(zoneId, news.url, region, news.frequency);
        }
        // 3. Sync — the only mutable aspect is `frequency`, and the API has
        //    no update call: converge drift by deleting and re-creating the
        //    schedule under the same identity. Skip entirely on a no-op (or
        //    when the user left frequency to the API default).
        if (news.frequency !== undefined &&
            observed.frequency !== news.frequency) {
            const previous = observed;
            yield* speed
                .deleteSchedule({ zoneId, url: news.url, region })
                .pipe(Effect.catchTag("TestScheduleNotFound", () => Effect.void));
            observed = yield* createAndObserve(zoneId, news.url, region, news.frequency).pipe(
            // Cloudflare caps DAILY-schedule creations per URL per day. We
            // already deleted the old schedule — restore it so a quota
            // rejection degrades to "unchanged" rather than "lost", then
            // surface the typed error.
            Effect.catchTag("TestScheduleQuotaReached", (error) => createAndObserve(zoneId, news.url, region, (previous.frequency ?? undefined)).pipe(Effect.flatMap(() => Effect.fail(error)))));
        }
        return toAttributes(observed, zoneId, news.url, region);
    }),
    delete: Effect.fn(function* ({ output }) {
        // The API is idempotent server-side (DELETE on a missing schedule
        // still answers 200), but tolerate the typed not-found anyway.
        yield* speed
            .deleteSchedule({
            zoneId: output.zoneId,
            url: output.url,
            region: output.region,
        })
            .pipe(Effect.catchTag("TestScheduleNotFound", () => Effect.void));
    }),
});
/**
 * Read a schedule, mapping "gone" (`TestScheduleNotFound`, Cloudflare
 * `speed.errors.schedule_not_found`) to `undefined`.
 */
const getSchedule = (zoneId, url, region) => speed.getSchedule({ zoneId, url, region }).pipe(Effect.map((s) => s), Effect.catchTag("TestScheduleNotFound", () => Effect.succeed(undefined)));
/**
 * Create a schedule and return the observed result. A concurrent create
 * surfaces as `TestScheduleAlreadyExists` — converge by re-reading the
 * schedule that won the race (and fail with the original error if it
 * vanished again in between).
 */
const createAndObserve = (zoneId, url, region, frequency) => speed.createSchedule({ zoneId, url, region, frequency }).pipe(Effect.flatMap((created) => created.schedule
    ? Effect.succeed(created.schedule)
    : // The create succeeded but echoed no schedule — re-observe.
        getScheduleOrFail(zoneId, url, region)), Effect.catchTag("TestScheduleAlreadyExists", () => getScheduleOrFail(zoneId, url, region)));
const getScheduleOrFail = (zoneId, url, region) => 
// Let the typed `TestScheduleNotFound` propagate — reaching this state
// means the schedule vanished between our calls; surfacing the typed
// error is more honest than inventing one.
speed
    .getSchedule({ zoneId, url, region })
    .pipe(Effect.map((s) => s));
const toAttributes = (observed, zoneId, url, region) => ({
    zoneId,
    // Prefer the server-normalized URL (e.g. trailing slash added).
    url: observed.url ?? normalizeUrl(url),
    region: (observed.region ?? region),
    // Cloudflare always echoes a frequency for a persisted schedule; the
    // distilled type is open/nullable, so default defensively.
    frequency: (observed.frequency ?? "WEEKLY"),
});
//# sourceMappingURL=TestSchedule.js.map