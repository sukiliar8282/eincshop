import * as athena from "@distilled.cloud/aws/athena";
import * as Layer from "effect/Layer";
import { makeWorkGroupScopedHttpBinding } from "./BindingHttp.js";
import { ListPreparedStatements } from "./ListPreparedStatements.js";
export const ListPreparedStatementsHttp = Layer.effect(ListPreparedStatements, makeWorkGroupScopedHttpBinding({
    tag: "AWS.Athena.ListPreparedStatements",
    operation: athena.listPreparedStatements,
    actions: ["athena:ListPreparedStatements"],
    injectWorkGroup: true,
}));
//# sourceMappingURL=ListPreparedStatementsHttp.js.map