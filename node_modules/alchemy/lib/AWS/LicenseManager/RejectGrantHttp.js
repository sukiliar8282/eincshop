import * as licensemanager from "@distilled.cloud/aws/license-manager";
import * as Layer from "effect/Layer";
import { makeLicenseManagerHttpBinding } from "./BindingHttp.js";
import { RejectGrant } from "./RejectGrant.js";
export const RejectGrantHttp = Layer.effect(RejectGrant, makeLicenseManagerHttpBinding({
    capability: "RejectGrant",
    iamActions: ["license-manager:RejectGrant"],
    operation: licensemanager.rejectGrant,
}));
//# sourceMappingURL=RejectGrantHttp.js.map