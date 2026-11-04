import * as servicecatalog from "@distilled.cloud/aws/service-catalog";
import * as Layer from "effect/Layer";
import { makeServiceCatalogHttpBinding } from "./BindingHttp.js";
import { ListLaunchPaths } from "./ListLaunchPaths.js";
export const ListLaunchPathsHttp = Layer.effect(ListLaunchPaths, makeServiceCatalogHttpBinding({
    capability: "ListLaunchPaths",
    iamActions: ["servicecatalog:ListLaunchPaths"],
    operation: servicecatalog.listLaunchPaths,
}));
//# sourceMappingURL=ListLaunchPathsHttp.js.map