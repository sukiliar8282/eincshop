import * as qapps from "@distilled.cloud/aws/qapps";
import * as Layer from "effect/Layer";
import { makeQAppsInstanceHttpBinding } from "./BindingHttp.js";
import { PredictQApp } from "./PredictQApp.js";
export const PredictQAppHttp = Layer.effect(PredictQApp, makeQAppsInstanceHttpBinding({
    capability: "PredictQApp",
    iamActions: ["qapps:PredictQApp"],
    operation: qapps.predictQApp,
}));
//# sourceMappingURL=PredictQAppHttp.js.map