import * as athena from "@distilled.cloud/aws/athena";
import * as Layer from "effect/Layer";
import { makeWorkGroupScopedHttpBinding } from "./BindingHttp.js";
import { ListNamedQueries } from "./ListNamedQueries.js";
export const ListNamedQueriesHttp = Layer.effect(ListNamedQueries, makeWorkGroupScopedHttpBinding({
    tag: "AWS.Athena.ListNamedQueries",
    operation: athena.listNamedQueries,
    actions: ["athena:ListNamedQueries"],
    injectWorkGroup: true,
}));
//# sourceMappingURL=ListNamedQueriesHttp.js.map