import * as athena from "@distilled.cloud/aws/athena";
import * as Layer from "effect/Layer";
import { makeWorkGroupScopedHttpBinding } from "./BindingHttp.js";
import { ListQueryExecutions } from "./ListQueryExecutions.js";
export const ListQueryExecutionsHttp = Layer.effect(ListQueryExecutions, makeWorkGroupScopedHttpBinding({
    tag: "AWS.Athena.ListQueryExecutions",
    operation: athena.listQueryExecutions,
    actions: ["athena:ListQueryExecutions"],
    injectWorkGroup: true,
}));
//# sourceMappingURL=ListQueryExecutionsHttp.js.map