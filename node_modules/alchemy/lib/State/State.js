import * as Context from "effect/Context";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
export const isActionState = (s) => !!s && s.kind === "action";
export const isResourceState = (s) => !!s && s.kind !== "task";
export class StateStoreError extends Data.TaggedError("StateStoreError") {
}
export class State extends Context.Service()("alchemy/State") {
}
//# sourceMappingURL=State.js.map