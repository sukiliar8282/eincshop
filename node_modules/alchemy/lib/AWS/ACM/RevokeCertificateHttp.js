import * as acm from "@distilled.cloud/aws/acm";
import * as Layer from "effect/Layer";
import { makeAcmCertificateHttpBinding } from "./BindingHttp.js";
import { RevokeCertificate, } from "./RevokeCertificate.js";
export const RevokeCertificateHttp = Layer.effect(RevokeCertificate, makeAcmCertificateHttpBinding({
    capability: "RevokeCertificate",
    iamActions: ["acm:RevokeCertificate"],
    operation: acm.revokeCertificate,
}));
//# sourceMappingURL=RevokeCertificateHttp.js.map