import * as codeconnections from "@distilled.cloud/aws/codeconnections";
import * as Layer from "effect/Layer";
import { makeCodeConnectionsAccountHttpBinding } from "./BindingHttp.js";
import { ListRepositoryLinks } from "./ListRepositoryLinks.js";
export const ListRepositoryLinksHttp = Layer.effect(ListRepositoryLinks, makeCodeConnectionsAccountHttpBinding({
    tag: "AWS.CodeConnections.ListRepositoryLinks",
    actions: ["codeconnections:ListRepositoryLinks"],
    operation: codeconnections.listRepositoryLinks,
}));
//# sourceMappingURL=ListRepositoryLinksHttp.js.map