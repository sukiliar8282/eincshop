import * as Data from "effect/Data";
import * as Binding from "../../Binding.js";
/**
 * The GraphQL endpoint returned a non-2xx response or an unparseable body.
 * GraphQL *field* errors do NOT fail the effect — they are surfaced on
 * {@link GraphQLResult.errors} alongside any partial `data`.
 */
export class GraphQLApiError extends Data.TaggedError("GraphQLApiError") {
}
export const GraphQL = Binding.Service("AWS.AppSync.GraphQL");
//# sourceMappingURL=GraphQL.js.map