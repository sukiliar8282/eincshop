import * as fms from "@distilled.cloud/aws/fms";
import * as Layer from "effect/Layer";
import { makeFmsHttpBinding } from "./BindingHttp.js";
import { PutProtocolsList } from "./PutProtocolsList.js";
export const PutProtocolsListHttp = Layer.effect(PutProtocolsList, makeFmsHttpBinding({
    capability: "PutProtocolsList",
    iamActions: ["fms:PutProtocolsList"],
    operation: fms.putProtocolsList,
}));
//# sourceMappingURL=PutProtocolsListHttp.js.map