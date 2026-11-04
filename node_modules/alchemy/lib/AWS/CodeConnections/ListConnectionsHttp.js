import * as codeconnections from "@distilled.cloud/aws/codeconnections";
import * as Layer from "effect/Layer";
import { makeCodeConnectionsAccountHttpBinding } from "./BindingHttp.js";
import { ListConnections } from "./ListConnections.js";
export const ListConnectionsHttp = Layer.effect(ListConnections, makeCodeConnectionsAccountHttpBinding({
    tag: "AWS.CodeConnections.ListConnections",
    actions: ["codeconnections:ListConnections"],
    operation: codeconnections.listConnections,
}));
//# sourceMappingURL=ListConnectionsHttp.js.map