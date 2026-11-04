import * as opensearch from "@distilled.cloud/aws/opensearch";
import * as Layer from "effect/Layer";
import { makeOpenSearchHttpBinding } from "./BindingHttp.js";
import { ListScheduledActions } from "./ListScheduledActions.js";
export const ListScheduledActionsHttp = Layer.effect(ListScheduledActions, makeOpenSearchHttpBinding({
    tag: "AWS.OpenSearch.ListScheduledActions",
    operation: opensearch.listScheduledActions,
    actions: ["es:ListScheduledActions"],
}));
//# sourceMappingURL=ListScheduledActionsHttp.js.map