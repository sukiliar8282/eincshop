import * as fms from "@distilled.cloud/aws/fms";
import * as Layer from "effect/Layer";
import { makeFmsHttpBinding } from "./BindingHttp.js";
import { GetProtocolsList } from "./GetProtocolsList.js";
export const GetProtocolsListHttp = Layer.effect(GetProtocolsList, makeFmsHttpBinding({
    capability: "GetProtocolsList",
    iamActions: ["fms:GetProtocolsList"],
    operation: fms.getProtocolsList,
}));
//# sourceMappingURL=GetProtocolsListHttp.js.map