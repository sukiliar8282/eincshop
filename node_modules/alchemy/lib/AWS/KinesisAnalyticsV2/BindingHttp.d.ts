import * as Effect from "effect/Effect";
import type { Application } from "./Application.ts";
/**
 * Shared scaffolding for AWS Kinesis Analytics v2 (Managed Service for
 * Apache Flink) HTTP bindings.
 *
 * NOT exported from `index.ts` — every `{Op}Http.ts` in this service is a
 * thin `Layer.effect(Cap, makeKinesisAnalyticsHttpBinding({ … }))` over the
 * builder below. Everything except the operation and the IAM action list is
 * boilerplate.
 *
 * Every bound operation addresses a single application: the request carries
 * an `ApplicationName` field which the runtime callable injects from the
 * bound {@link Application}, and the deploy-time half grants `actions` on
 * the application's ARN (all `kinesisanalytics:*Application*` actions
 * authorize against the application resource).
 */
/**
 * Account-level variant of {@link makeKinesisAnalyticsHttpBinding} for
 * operations that take no application argument (`ListApplications`). The
 * deploy-time half grants `actions` on `*` — Kinesis Analytics list calls
 * are not resource-scoped.
 */
export declare const makeKinesisAnalyticsAccountHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.KinesisAnalyticsV2.ListApplications`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
export declare const makeKinesisAnalyticsHttpBinding: <I extends {
    ApplicationName?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.KinesisAnalyticsV2.StartApplication`. */
    tag: string;
    /** The distilled operation; `ApplicationName` is injected from the application. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the application ARN. */
    actions: readonly string[];
}) => Effect.Effect<<App extends Application>(application: App) => Effect.Effect<(request?: Omit<I, "ApplicationName"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map