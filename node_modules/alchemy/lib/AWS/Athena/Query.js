import * as Data from "effect/Data";
import * as Binding from "../../Binding.js";
/**
 * Raised when a query reaches a terminal non-`SUCCEEDED` state (FAILED or
 * CANCELLED), or does not settle within the bounded poll window.
 */
export class AthenaQueryFailed extends Data.TaggedError("AthenaQueryFailed") {
}
export const Query = Binding.Service("AWS.Athena.Query");
//# sourceMappingURL=Query.js.map