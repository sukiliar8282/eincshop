import * as qapps from "@distilled.cloud/aws/qapps";
import * as Layer from "effect/Layer";
import { makeQAppHttpBinding } from "./BindingHttp.js";
import { UpdateQAppSessionMetadata } from "./UpdateQAppSessionMetadata.js";
export const UpdateQAppSessionMetadataHttp = Layer.effect(UpdateQAppSessionMetadata, makeQAppHttpBinding({
    capability: "UpdateQAppSessionMetadata",
    iamActions: ["qapps:UpdateQAppSessionMetadata"],
    operation: qapps.updateQAppSessionMetadata,
}));
//# sourceMappingURL=UpdateQAppSessionMetadataHttp.js.map