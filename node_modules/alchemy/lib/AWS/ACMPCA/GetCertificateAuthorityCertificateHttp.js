import * as acmpca from "@distilled.cloud/aws/acm-pca";
import * as Layer from "effect/Layer";
import { makeACMPCAHttpBinding } from "./BindingHttp.js";
import { GetCertificateAuthorityCertificate } from "./GetCertificateAuthorityCertificate.js";
export const GetCertificateAuthorityCertificateHttp = Layer.effect(GetCertificateAuthorityCertificate, makeACMPCAHttpBinding({
    action: "GetCertificateAuthorityCertificate",
    operation: acmpca.getCertificateAuthorityCertificate,
}));
//# sourceMappingURL=GetCertificateAuthorityCertificateHttp.js.map