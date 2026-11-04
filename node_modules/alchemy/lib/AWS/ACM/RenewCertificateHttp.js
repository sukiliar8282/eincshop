import * as acm from "@distilled.cloud/aws/acm";
import * as Layer from "effect/Layer";
import { makeAcmCertificateHttpBinding } from "./BindingHttp.js";
import { RenewCertificate } from "./RenewCertificate.js";
export const RenewCertificateHttp = Layer.effect(RenewCertificate, makeAcmCertificateHttpBinding({
    capability: "RenewCertificate",
    iamActions: ["acm:RenewCertificate"],
    operation: acm.renewCertificate,
}));
//# sourceMappingURL=RenewCertificateHttp.js.map