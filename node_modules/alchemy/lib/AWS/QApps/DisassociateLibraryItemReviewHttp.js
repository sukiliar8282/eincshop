import * as qapps from "@distilled.cloud/aws/qapps";
import * as Layer from "effect/Layer";
import { makeQAppsInstanceHttpBinding } from "./BindingHttp.js";
import { DisassociateLibraryItemReview } from "./DisassociateLibraryItemReview.js";
export const DisassociateLibraryItemReviewHttp = Layer.effect(DisassociateLibraryItemReview, makeQAppsInstanceHttpBinding({
    capability: "DisassociateLibraryItemReview",
    iamActions: ["qapps:DisassociateLibraryItemReview"],
    operation: qapps.disassociateLibraryItemReview,
}));
//# sourceMappingURL=DisassociateLibraryItemReviewHttp.js.map