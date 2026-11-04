import * as acm from "@distilled.cloud/aws/acm";
import * as Layer from "effect/Layer";
import { makeAcmCertificateHttpBinding } from "./BindingHttp.js";
import { ExportCertificate, } from "./ExportCertificate.js";
export const ExportCertificateHttp = Layer.effect(ExportCertificate, makeAcmCertificateHttpBinding({
    capability: "ExportCertificate",
    iamActions: ["acm:ExportCertificate"],
    operation: acm.exportCertificate,
}));
//# sourceMappingURL=ExportCertificateHttp.js.map