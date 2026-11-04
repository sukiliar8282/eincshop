import * as Effect from "effect/Effect";
import type { Farm } from "./Farm.ts";
import type { Queue } from "./Queue.ts";
/**
 * Shared scaffolding for AWS Deadline Cloud HTTP bindings.
 *
 * NOT exported from `index.ts` — every thin `{Op}Http.ts` in this service is
 * a `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the builders
 * below. Everything except the operation, the IAM action list, and the
 * injected identifiers is boilerplate.
 */
/**
 * Build the impl Effect for a queue-scoped job operation. The runtime half
 * injects the bound {@link Queue}'s `farmId` and `queueId` into every
 * request; the deploy-time half grants `actions` on the queue's ARN and on
 * its jobs (`{queueArn}/job/*`), since Deadline authorizes job-level actions
 * (GetJob, UpdateJob, ListSteps, …) against the job resource.
 */
export declare const makeDeadlineQueueHttpBinding: <I extends {
    farmId: string;
    queueId: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Deadline.CreateJob`. */
    tag: string;
    /** The distilled operation; `farmId`/`queueId` are injected. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the queue ARN and its jobs. */
    actions: readonly string[];
}) => Effect.Effect<(queue: Queue) => Effect.Effect<(request?: Omit<I, "farmId" | "queueId"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a queue-scoped search operation
 * (`SearchJobs`/`SearchSteps`/`SearchTasks` take a `queueIds` array rather
 * than a single `queueId`). The runtime half injects the bound
 * {@link Queue}'s `farmId` and `queueIds: [queueId]`; the deploy-time half
 * grants `actions` on the queue's ARN and its jobs.
 */
export declare const makeDeadlineQueueSearchHttpBinding: <I extends {
    farmId: string;
    queueIds: string[];
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Deadline.SearchJobs`. */
    tag: string;
    /** The distilled operation; `farmId`/`queueIds` are injected. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the queue ARN and its jobs. */
    actions: readonly string[];
}) => Effect.Effect<(queue: Queue) => Effect.Effect<(request?: Omit<I, "farmId" | "queueIds"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a farm-scoped operation (usage statistics
 * aggregations). The runtime half injects the bound {@link Farm}'s `farmId`;
 * the deploy-time half grants `actions` on the farm's ARN and everything
 * under it (queues/fleets referenced by the aggregation's `resourceIds`).
 */
export declare const makeDeadlineFarmHttpBinding: <I extends {
    farmId: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Deadline.GetSessionsStatisticsAggregation`. */
    tag: string;
    /** The distilled operation; `farmId` is injected. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the farm ARN and its sub-resources. */
    actions: readonly string[];
}) => Effect.Effect<(farm: Farm) => Effect.Effect<(request?: Omit<I, "farmId"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map