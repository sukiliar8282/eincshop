import * as qapps from "@distilled.cloud/aws/qapps";
import * as Layer from "effect/Layer";
import { makeQAppHttpBinding } from "./BindingHttp.js";
import { StartQAppSession } from "./StartQAppSession.js";
export const StartQAppSessionHttp = Layer.effect(StartQAppSession, makeQAppHttpBinding({
    capability: "StartQAppSession",
    iamActions: ["qapps:StartQAppSession"],
    operation: qapps.startQAppSession,
    injectAppId: true,
}));
//# sourceMappingURL=StartQAppSessionHttp.js.map