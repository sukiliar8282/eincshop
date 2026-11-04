import * as fms from "@distilled.cloud/aws/fms";
import * as Layer from "effect/Layer";
import { makeFmsHttpBinding } from "./BindingHttp.js";
import { ListAppsLists } from "./ListAppsLists.js";
export const ListAppsListsHttp = Layer.effect(ListAppsLists, makeFmsHttpBinding({
    capability: "ListAppsLists",
    iamActions: ["fms:ListAppsLists"],
    operation: fms.listAppsLists,
}));
//# sourceMappingURL=ListAppsListsHttp.js.map