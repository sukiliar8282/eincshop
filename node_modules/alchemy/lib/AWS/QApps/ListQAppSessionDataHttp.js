import * as qapps from "@distilled.cloud/aws/qapps";
import * as Layer from "effect/Layer";
import { makeQAppHttpBinding } from "./BindingHttp.js";
import { ListQAppSessionData } from "./ListQAppSessionData.js";
export const ListQAppSessionDataHttp = Layer.effect(ListQAppSessionData, makeQAppHttpBinding({
    capability: "ListQAppSessionData",
    iamActions: ["qapps:ListQAppSessionData"],
    operation: qapps.listQAppSessionData,
}));
//# sourceMappingURL=ListQAppSessionDataHttp.js.map