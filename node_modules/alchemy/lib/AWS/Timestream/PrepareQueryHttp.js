import * as TSQ from "@distilled.cloud/aws/timestream-query";
import * as Layer from "effect/Layer";
import { makeQueryTableHttpBinding } from "./BindingHttp.js";
import { PrepareQuery } from "./PrepareQuery.js";
export const PrepareQueryHttp = Layer.effect(PrepareQuery, makeQueryTableHttpBinding({
    tag: "AWS.Timestream.PrepareQuery",
    operation: TSQ.prepareQuery,
    // Preparing a query validates it against the tables the SQL references.
    actions: ["timestream:PrepareQuery", "timestream:Select"],
}));
//# sourceMappingURL=PrepareQueryHttp.js.map