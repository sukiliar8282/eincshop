import * as qapps from "@distilled.cloud/aws/qapps";
import * as Layer from "effect/Layer";
import { makeQAppHttpBinding } from "./BindingHttp.js";
import { ImportDocument } from "./ImportDocument.js";
export const ImportDocumentHttp = Layer.effect(ImportDocument, makeQAppHttpBinding({
    capability: "ImportDocument",
    iamActions: ["qapps:ImportDocument"],
    operation: qapps.importDocument,
    injectAppId: true,
}));
//# sourceMappingURL=ImportDocumentHttp.js.map