import * as Effect from "effect/Effect";
import * as EngineDrift from "../../Drift.js";
import { applySession, Progress, withSpanEvents } from "../Progress.js";
import { open } from "../Session.js";
import * as Stack from "./stack.js";
/** Whether the drift check found anything worth repairing. */
export const hasDrift = (snapshot) => snapshot.resources.some((resource) => resource.status === "drifted" || resource.status === "missing");
const status = (action) => action === "unchanged"
    ? "in-sync"
    : action === "missing"
        ? "missing"
        : "drifted";
/** Compare deployed state against the real cloud and plan the repair. */
export const inspect = Effect.fn("Alchemist.drift.inspect")(function* (target) {
    const report = withSpanEvents(yield* Progress);
    // `open` emits importing-module / resolving-services at the real work
    // boundaries; hand it the wrapped reporter so they land in traces too.
    const session = yield* open(target).pipe(Effect.provideService(Progress, report));
    const identity = {
        name: session.stack.name,
        stage: session.stack.stage,
    };
    const { result, plan } = yield* EngineDrift.plan(identity).pipe(
    // The engine's phase and per-resource observation events flow through
    // the same wrapped reporter; drift-flavored wording is the renderer's
    // job (renderPlanning's computingLabel).
    Effect.provideService(Progress, report), Effect.provide(session.context));
    yield* report({ _tag: "plan.phase", phase: "plan-ready" });
    return {
        stack: identity,
        resources: Object.values(result.resources)
            .filter((resource) => resource.action !== "skipped")
            .map((resource) => ({
            fqn: resource.fqn,
            logicalId: resource.logicalId,
            resourceType: resource.resourceType,
            status: status(resource.action),
            actual: resource.attr,
        })),
        repairPlan: { summary: Stack.summarize(plan), native: plan },
        session,
    };
});
/**
 * Converge state back to the cloud's actual shape. Engine apply events are
 * reported through {@link Progress}.
 */
export const repair = Effect.fn("Alchemist.drift.repair")(function* (snapshot) {
    const report = withSpanEvents(yield* Progress);
    return yield* Effect.provide(EngineDrift.repair({ name: snapshot.stack.name, stage: snapshot.stack.stage }, { session: applySession(report) }), snapshot.session.context);
});
//# sourceMappingURL=drift.js.map