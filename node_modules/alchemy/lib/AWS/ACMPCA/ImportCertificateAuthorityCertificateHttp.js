import * as acmpca from "@distilled.cloud/aws/acm-pca";
import * as Layer from "effect/Layer";
import { makeACMPCAHttpBinding } from "./BindingHttp.js";
import { ImportCertificateAuthorityCertificate } from "./ImportCertificateAuthorityCertificate.js";
export const ImportCertificateAuthorityCertificateHttp = Layer.effect(ImportCertificateAuthorityCertificate, makeACMPCAHttpBinding({
    action: "ImportCertificateAuthorityCertificate",
    operation: acmpca.importCertificateAuthorityCertificate,
}));
//# sourceMappingURL=ImportCertificateAuthorityCertificateHttp.js.map