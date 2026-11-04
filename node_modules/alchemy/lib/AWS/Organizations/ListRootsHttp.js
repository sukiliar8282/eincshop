import * as organizations from "@distilled.cloud/aws/organizations";
import * as Layer from "effect/Layer";
import { makeOrganizationsHttpBinding } from "./BindingHttp.js";
import { ListRoots } from "./ListRoots.js";
export const ListRootsHttp = Layer.effect(ListRoots, makeOrganizationsHttpBinding({
    capability: "ListRoots",
    iamActions: ["organizations:ListRoots"],
    operation: organizations.listRoots,
}));
//# sourceMappingURL=ListRootsHttp.js.map