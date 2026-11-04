import * as TSQ from "@distilled.cloud/aws/timestream-query";
import * as Layer from "effect/Layer";
import { makeQueryTableHttpBinding } from "./BindingHttp.js";
import { Query } from "./Query.js";
export const QueryHttp = Layer.effect(Query, makeQueryTableHttpBinding({
    tag: "AWS.Timestream.Query",
    operation: TSQ.query,
    actions: ["timestream:Select"],
}));
//# sourceMappingURL=QueryHttp.js.map