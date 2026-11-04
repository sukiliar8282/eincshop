import * as acmpca from "@distilled.cloud/aws/acm-pca";
import * as Layer from "effect/Layer";
import { makeACMPCAHttpBinding } from "./BindingHttp.js";
import { IssueCertificate } from "./IssueCertificate.js";
export const IssueCertificateHttp = Layer.effect(IssueCertificate, makeACMPCAHttpBinding({
    action: "IssueCertificate",
    operation: acmpca.issueCertificate,
}));
//# sourceMappingURL=IssueCertificateHttp.js.map