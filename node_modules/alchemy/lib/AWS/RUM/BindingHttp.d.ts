import * as Effect from "effect/Effect";
import type { AppMonitor } from "./AppMonitor.ts";
/**
 * Shared scaffolding for CloudWatch RUM HTTP bindings.
 *
 * NOT exported from `index.ts` — every `{Op}Http.ts` in this service is a
 * thin `Layer.effect(Cap, make…HttpBinding({ … }))` over the builder below
 * (or reuses {@link bindRumAppMonitorPolicy} when the runtime callable needs
 * bespoke request shaping, like `PutRumEvents` injecting the monitor id and
 * details). Everything except the operation and the IAM action list is
 * boilerplate.
 */
/**
 * Deploy-time half shared by every app-monitor-scoped RUM binding: resolve
 * the hosting Function and grant `actions` on the monitor's ARN. A no-op
 * inside the deployed runtime.
 */
export declare const bindRumAppMonitorPolicy: (options: {
    tag: string;
    monitor: AppMonitor;
    actions: readonly string[];
}) => Effect.Effect<void, never, never>;
/**
 * Build the impl Effect for an operation scoped to a single bound
 * {@link AppMonitor} and addressed by monitor name. The runtime callable
 * injects the monitor's name as the request's `Name`; the deploy-time half
 * grants `actions` on the monitor ARN.
 */
export declare const makeRumAppMonitorHttpBinding: <I extends {
    Name: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.RUM.GetAppMonitorData`. */
    tag: string;
    /** The distilled operation; `Name` is injected from the monitor. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the monitor ARN. */
    actions: readonly string[];
}) => Effect.Effect<(monitor: AppMonitor) => Effect.Effect<(request: Omit<I, "Name">) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map