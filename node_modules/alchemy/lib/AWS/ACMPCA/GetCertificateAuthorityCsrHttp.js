import * as acmpca from "@distilled.cloud/aws/acm-pca";
import * as Layer from "effect/Layer";
import { makeACMPCAHttpBinding } from "./BindingHttp.js";
import { GetCertificateAuthorityCsr } from "./GetCertificateAuthorityCsr.js";
export const GetCertificateAuthorityCsrHttp = Layer.effect(GetCertificateAuthorityCsr, makeACMPCAHttpBinding({
    action: "GetCertificateAuthorityCsr",
    operation: acmpca.getCertificateAuthorityCsr,
}));
//# sourceMappingURL=GetCertificateAuthorityCsrHttp.js.map