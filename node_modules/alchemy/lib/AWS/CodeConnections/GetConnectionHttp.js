import * as codeconnections from "@distilled.cloud/aws/codeconnections";
import * as Layer from "effect/Layer";
import { makeConnectionScopedHttpBinding } from "./BindingHttp.js";
import { GetConnection } from "./GetConnection.js";
export const GetConnectionHttp = Layer.effect(GetConnection, makeConnectionScopedHttpBinding({
    tag: "AWS.CodeConnections.GetConnection",
    actions: ["codeconnections:GetConnection"],
    operation: codeconnections.getConnection,
}));
//# sourceMappingURL=GetConnectionHttp.js.map