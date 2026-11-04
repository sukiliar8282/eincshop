import * as qapps from "@distilled.cloud/aws/qapps";
import * as Layer from "effect/Layer";
import { makeQAppsInstanceHttpBinding } from "./BindingHttp.js";
import { ListCategories } from "./ListCategories.js";
export const ListCategoriesHttp = Layer.effect(ListCategories, makeQAppsInstanceHttpBinding({
    capability: "ListCategories",
    iamActions: ["qapps:ListCategories"],
    operation: qapps.listCategories,
}));
//# sourceMappingURL=ListCategoriesHttp.js.map