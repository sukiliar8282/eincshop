import * as mediaconvert from "@distilled.cloud/aws/mediaconvert";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface QueueProps {
    /**
     * Name of the queue. Must be unique within the account/region and match
     * `^[\w-]+$`. If omitted, a unique name is generated. Changing the name
     * replaces the queue.
     */
    queueName?: string;
    /**
     * Optional description of the queue.
     */
    description?: string;
    /**
     * Pricing plan for the queue. `ON_DEMAND` queues bill per transcode minute;
     * `RESERVED` queues purchase a reservation (a paid commitment). Changing the
     * pricing plan replaces the queue.
     * @default "ON_DEMAND"
     */
    pricingPlan?: mediaconvert.PricingPlan;
    /**
     * Reservation plan for a `RESERVED` queue (commitment, renewal type, and the
     * number of reserved render units). Ignored for `ON_DEMAND` queues.
     */
    reservationPlanSettings?: mediaconvert.ReservationPlanSettings;
    /**
     * Initial/desired queue status. `ACTIVE` queues process jobs; `PAUSED`
     * queues hold submitted jobs until resumed.
     * @default "ACTIVE"
     */
    status?: mediaconvert.QueueStatus;
    /**
     * Maximum number of jobs the queue processes concurrently (ON_DEMAND).
     */
    concurrentJobs?: number;
    /**
     * User-defined tags for the queue.
     */
    tags?: Record<string, string>;
}
export interface Queue extends Resource<"AWS.MediaConvert.Queue", QueueProps, {
    queueName: string;
    queueArn: string;
    type: string | undefined;
    status: string | undefined;
    pricingPlan: string | undefined;
}, never, Providers> {
}
/**
 * An AWS Elemental MediaConvert queue — the pool that submitted transcode jobs
 * are scheduled against. Every account has a system `Default` on-demand queue;
 * create additional queues to isolate workloads or to purchase reserved
 * render capacity.
 *
 * ### Creating a Queue
 * **Example:** On-Demand Queue
 * ```typescript
 * const queue = yield* MediaConvert.Queue("Transcode", {
 *   description: "Marketing video transcodes",
 * });
 * ```
 *
 * **Example:** Paused Queue
 * ```typescript
 * const queue = yield* MediaConvert.Queue("Transcode", {
 *   status: "PAUSED",
 *   tags: { team: "media" },
 * });
 * ```
 *
 * ### Reserved Capacity
 * **Example:** Reserved Queue with a One-Year Commitment
 * ```typescript
 * const queue = yield* MediaConvert.Queue("Reserved", {
 *   pricingPlan: "RESERVED",
 *   reservationPlanSettings: {
 *     Commitment: "ONE_YEAR",
 *     RenewalType: "EXPIRE",
 *     ReservedSlots: 1,
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Queue: import("../../Resource.ts").ResourceClass<Queue>;
export declare const QueueProvider: () => import("effect/Layer").Layer<Provider.Provider<Queue>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Queue.d.ts.map