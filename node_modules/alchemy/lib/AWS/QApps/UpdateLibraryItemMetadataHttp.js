import * as qapps from "@distilled.cloud/aws/qapps";
import * as Layer from "effect/Layer";
import { makeQAppsInstanceHttpBinding } from "./BindingHttp.js";
import { UpdateLibraryItemMetadata } from "./UpdateLibraryItemMetadata.js";
export const UpdateLibraryItemMetadataHttp = Layer.effect(UpdateLibraryItemMetadata, makeQAppsInstanceHttpBinding({
    capability: "UpdateLibraryItemMetadata",
    iamActions: ["qapps:UpdateLibraryItemMetadata"],
    operation: qapps.updateLibraryItemMetadata,
}));
//# sourceMappingURL=UpdateLibraryItemMetadataHttp.js.map