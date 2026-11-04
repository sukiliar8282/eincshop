import * as qapps from "@distilled.cloud/aws/qapps";
import * as Layer from "effect/Layer";
import { makeQAppHttpBinding } from "./BindingHttp.js";
import { GetQAppSessionMetadata } from "./GetQAppSessionMetadata.js";
export const GetQAppSessionMetadataHttp = Layer.effect(GetQAppSessionMetadata, makeQAppHttpBinding({
    capability: "GetQAppSessionMetadata",
    iamActions: ["qapps:GetQAppSessionMetadata"],
    operation: qapps.getQAppSessionMetadata,
}));
//# sourceMappingURL=GetQAppSessionMetadataHttp.js.map