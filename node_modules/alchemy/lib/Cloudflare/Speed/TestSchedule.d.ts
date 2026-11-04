import * as speed from "@distilled.cloud/cloudflare/speed";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Speed.TestSchedule";
type TypeId = typeof TypeId;
/**
 * Region a scheduled Observatory (speed) test runs from. GCP-style region
 * identifiers — Cloudflare keys schedules per `(url, region)` pair.
 */
export type TestRegion = "asia-east1" | "asia-northeast1" | "asia-northeast2" | "asia-south1" | "asia-southeast1" | "australia-southeast1" | "europe-north1" | "europe-southwest1" | "europe-west1" | "europe-west2" | "europe-west3" | "europe-west4" | "europe-west8" | "europe-west9" | "me-west1" | "southamerica-east1" | "us-central1" | "us-east1" | "us-east4" | "us-south1" | "us-west1";
/**
 * How often a scheduled test runs.
 */
export type TestFrequency = "DAILY" | "WEEKLY";
export interface TestScheduleProps {
    /**
     * Zone the scheduled test belongs to.
     *
     * Immutable — moving a schedule to a different zone triggers a
     * replacement.
     */
    zoneId: string;
    /**
     * The page URL to test, e.g. `example.com/` or `example.com/pricing`.
     * Must be a page on the zone. Cloudflare normalizes a bare hostname to
     * `host/` (trailing slash).
     *
     * Immutable — the URL is the schedule's identity (path parameter), so
     * changing it triggers a replacement. Deliberately a plain `string` (not
     * `string`) so it is statically knowable inside `diff`.
     */
    url: string;
    /**
     * Region the test runs from. Schedules are keyed per `(url, region)` —
     * changing the region triggers a replacement (a new schedule in the new
     * region is created and the old one deleted).
     * @default "us-central1"
     */
    region?: TestRegion;
    /**
     * How often the test runs. The API has no update call, so changing the
     * frequency is converged in place by deleting and re-creating the
     * schedule (same identity — not a replacement).
     * @default WEEKLY for free plans, DAILY for paid plans (API default)
     */
    frequency?: TestFrequency;
}
export interface TestScheduleAttributes {
    /** Zone the schedule belongs to. */
    zoneId: string;
    /** The tested page URL as normalized by Cloudflare (e.g. `example.com/`). */
    url: string;
    /** Region the test runs from. */
    region: TestRegion;
    /** How often the test runs. */
    frequency: TestFrequency;
}
export type TestSchedule = Resource<TypeId, TestScheduleProps, TestScheduleAttributes, never, Providers>;
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
export declare const TestSchedule: import("../../Resource.ts").ResourceClass<TestSchedule>;
/**
 * Returns true if the given value is a TestSchedule resource.
 */
export declare const isTestSchedule: (value: unknown) => value is TestSchedule;
export declare const TestScheduleProvider: () => import("effect/Layer").Layer<Provider.Provider<TestSchedule>, never, CloudflareEnvironment | speed.CloudflareOpContext>;
export {};
//# sourceMappingURL=TestSchedule.d.ts.map