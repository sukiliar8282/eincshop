import * as kendra from "@distilled.cloud/aws/kendra";
import * as Layer from "effect/Layer";
import { makeKendraIndexHttpBinding } from "./BindingHttp.js";
import { Query } from "./Query.js";
export const QueryHttp = Layer.effect(Query, makeKendraIndexHttpBinding({
    tag: "AWS.Kendra.Query",
    operation: kendra.query,
    actions: ["kendra:Query"],
}));
//# sourceMappingURL=QueryHttp.js.map