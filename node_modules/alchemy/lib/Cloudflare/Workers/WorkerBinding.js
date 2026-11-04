import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import { isYieldableEffectLike } from "../../Util/effect.js";
import { Dataset } from "../AnalyticsEngine/Dataset.js";
import { SendEmail } from "../Email/SendEmail.js";
import { makeRpcStub } from "./Rpc.js";
import { Worker, WorkerEnvironment } from "./Worker.js";
export const bindWorker = Effect.fn(function* (workerEff) {
    // Worker classes and regular Effects are both yieldable here.
    const worker = isYieldableEffectLike(workerEff)
        ? yield* workerEff
        : workerEff;
    const self = yield* Worker;
    yield* self.bind `${worker}`({
        bindings: [
            {
                type: "service",
                name: worker.LogicalId,
                service: worker.workerName,
            },
        ],
    });
    // `bindWorker` runs at *init* phase (both at plantime and at runtime
    // cold-start). `WorkerEnvironment` only exists at exec phase on the
    // deployed worker, so we hand `makeRpcStub` an `Effect<stub>` that
    // resolves the binding lazily on each method call.
    const stubEff = WorkerEnvironment.pipe(Effect.map((env) => env[worker.LogicalId]));
    return makeRpcStub(stubEff);
});
//# sourceMappingURL=WorkerBinding.js.map