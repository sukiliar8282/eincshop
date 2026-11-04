import * as qapps from "@distilled.cloud/aws/qapps";
import * as Layer from "effect/Layer";
import { makeQAppsInstanceHttpBinding } from "./BindingHttp.js";
import { ListQApps } from "./ListQApps.js";
export const ListQAppsHttp = Layer.effect(ListQApps, makeQAppsInstanceHttpBinding({
    capability: "ListQApps",
    iamActions: ["qapps:ListQApps"],
    operation: qapps.listQApps,
}));
//# sourceMappingURL=ListQAppsHttp.js.map