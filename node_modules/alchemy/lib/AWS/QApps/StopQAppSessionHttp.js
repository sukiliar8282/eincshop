import * as qapps from "@distilled.cloud/aws/qapps";
import * as Layer from "effect/Layer";
import { makeQAppHttpBinding } from "./BindingHttp.js";
import { StopQAppSession } from "./StopQAppSession.js";
export const StopQAppSessionHttp = Layer.effect(StopQAppSession, makeQAppHttpBinding({
    capability: "StopQAppSession",
    iamActions: ["qapps:StopQAppSession"],
    operation: qapps.stopQAppSession,
}));
//# sourceMappingURL=StopQAppSessionHttp.js.map