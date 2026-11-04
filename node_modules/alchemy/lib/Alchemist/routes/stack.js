import * as Clock from "effect/Clock";
import * as Effect from "effect/Effect";
import { apply as applyPlan } from "../../Apply.js";
import * as Plan from "../../Plan.js";
import { applySession, Progress, withSpanEvents } from "../Progress.js";
import { open } from "../Session.js";
/** Whether a plan proposes any cloud mutations (i.e. approval-worthy work). */
export const hasChanges = (summary) => summary.create +
    summary.update +
    summary.adopted +
    summary.replace +
    summary.delete +
    summary.orphaned >
    0;
export const summarize = (plan) => {
    const summary = {
        create: 0,
        update: 0,
        adopted: 0,
        replace: 0,
        delete: 0,
        orphaned: 0,
        noop: 0,
    };
    for (const node of Object.values(plan.resources))
        summary[node.action]++;
    for (const node of Object.values(plan.deletions)) {
        if (node !== undefined)
            summary[node.action]++;
    }
    return summary;
};
/**
 * Import the stack, resolve its services, and compute a deploy or destroy
 * plan. Planning phases are reported through {@link Progress}; the returned
 * snapshot is what {@link apply} executes.
 */
export const plan = Effect.fn("Alchemist.stack.plan")(function* (input) {
    const report = withSpanEvents(yield* Progress);
    // Everything below emits into the same flat ProgressEvent channel:
    // `open` reports importing-module / resolving-services at the real work
    // boundaries, the engine reports loading-state / computing-plan and the
    // per-node diff events. Re-providing the wrapped reporter is all the
    // route does — no translation layer.
    const session = yield* open(input.target, input).pipe(Effect.provideService(Progress, report));
    const native = (yield* (input.operation === "destroy"
        ? Plan.destroy(session.stack)
        : Plan.make(session.stack, { force: input.force })).pipe(Effect.provideService(Progress, report), Effect.provide(session.context)));
    yield* report({ _tag: "plan.phase", phase: "plan-ready" });
    return {
        stack: { name: session.stack.name, stage: session.stack.stage },
        summary: summarize(native),
        ...Plan.describePlan(native),
        native,
        createdAt: new Date(yield* Clock.currentTimeMillis),
        session,
    };
});
/**
 * Apply a computed plan. Engine apply events are reported through
 * {@link Progress} as `ApplyEvent`.
 */
export const apply = Effect.fn("Alchemist.stack.apply")(function* (snapshot) {
    const report = withSpanEvents(yield* Progress);
    return yield* Effect.provide(applyPlan(snapshot.native, { session: applySession(report) }), snapshot.session.context);
});
//# sourceMappingURL=stack.js.map