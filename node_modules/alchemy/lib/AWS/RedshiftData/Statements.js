import * as Data from "effect/Data";
import * as Binding from "../../Binding.js";
/**
 * Raised when a statement reaches a terminal `FAILED` or `ABORTED` status
 * while a composite `query` waits for it to finish.
 */
export class RedshiftStatementFailed extends Data.TaggedError("RedshiftStatementFailed") {
}
export const Statements = Binding.Service("AWS.RedshiftData.Statements");
//# sourceMappingURL=Statements.js.map