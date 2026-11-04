import * as organizations from "@distilled.cloud/aws/organizations";
import * as Layer from "effect/Layer";
import { makeOrganizationsHttpBinding } from "./BindingHttp.js";
import { ListTagsForResource } from "./ListTagsForResource.js";
export const ListTagsForResourceHttp = Layer.effect(ListTagsForResource, makeOrganizationsHttpBinding({
    capability: "ListTagsForResource",
    iamActions: ["organizations:ListTagsForResource"],
    operation: organizations.listTagsForResource,
}));
//# sourceMappingURL=ListTagsForResourceHttp.js.map