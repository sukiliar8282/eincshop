import * as alerting from "@distilled.cloud/cloudflare/alerting";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Alerting.Silence";
type TypeId = typeof TypeId;
export interface SilenceProps {
    /**
     * The notification policy to silence. References a
     * {@link NotificationPolicy} id. Changing the policy triggers a
     * replacement — the silence update API cannot move a silence to a
     * different policy.
     */
    policyId: string;
    /**
     * When the silence window starts, as an RFC3339/ISO8601 timestamp (e.g.
     * `2026-07-01T00:00:00Z`). Must be within 90 days of now — Cloudflare
     * rejects windows further out with `InvalidSilence`. Pass an explicit,
     * deterministic value; the provider never derives times from the clock.
     * Mutable — updated in place.
     */
    startTime: string;
    /**
     * When the silence window ends, as an RFC3339/ISO8601 timestamp. Must be
     * after `startTime` (`InvalidSilence` otherwise).
     * Mutable — updated in place.
     */
    endTime: string;
}
export interface SilenceAttributes {
    /** Cloudflare-assigned silence id. */
    silenceId: string;
    /** Account that owns this silence. */
    accountId: string;
    /** The notification policy this silence applies to. */
    policyId: string;
    /** When the silence window starts (ISO8601). */
    startTime: string;
    /** When the silence window ends (ISO8601). */
    endTime: string;
    /** ISO8601 creation timestamp. */
    createdAt: string | undefined;
    /** ISO8601 last-modified timestamp. */
    updatedAt: string | undefined;
}
export type Silence = Resource<TypeId, SilenceProps, SilenceAttributes, never, Providers>;
/**
 * A Cloudflare Notifications silence window.
 *
 * A silence suppresses notification dispatches for a
 * {@link NotificationPolicy} between `startTime` and `endTime` — e.g.
 * during a planned maintenance window. The window times are explicit
 * ISO8601 props supplied by you; Cloudflare requires the start time to be
 * within 90 days of now.
 *
 * Note: the create API returns no id, so the provider resolves the created
 * silence by listing and matching on `(policyId, startTime, endTime)`. Two
 * silences sharing the exact same policy and window are indistinguishable.
 * ### Creating a silence
 * **Example:** Silence a policy during a maintenance window
 * ```typescript
 * const policy = yield* Cloudflare.Alerting.NotificationPolicy("SslAlerts", {
 *   alertType: "universal_ssl_event_type",
 *   mechanisms: { email: [{ id: "ops@example.com" }] },
 * });
 *
 * yield* Cloudflare.Alerting.Silence("MaintenanceWindow", {
 *   policyId: policy.policyId,
 *   startTime: "2026-07-01T00:00:00Z",
 *   endTime: "2026-07-01T04:00:00Z",
 * });
 * ```
 *
 * ### Updating the window
 * **Example:** Extend the silence end time in place
 * Window times are mutable — changing them updates the existing silence.
 * ```typescript
 * yield* Cloudflare.Alerting.Silence("MaintenanceWindow", {
 *   policyId: policy.policyId,
 *   startTime: "2026-07-01T00:00:00Z",
 *   endTime: "2026-07-01T08:00:00Z",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/notifications/
 *
 * @resource
 * @product Alerting
 * @category Observability & Analytics
 */
export declare const Silence: import("../../Resource.ts").ResourceClass<Silence>;
/**
 * Returns true if the given value is a Silence resource.
 */
export declare const isSilence: (value: unknown) => value is Silence;
export declare const SilenceProvider: () => import("effect/Layer").Layer<Provider.Provider<Silence>, never, CloudflareEnvironment | alerting.CloudflareOpContext>;
export {};
//# sourceMappingURL=Silence.d.ts.map