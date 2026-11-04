import * as acmpca from "@distilled.cloud/aws/acm-pca";
import * as Layer from "effect/Layer";
import { makeACMPCAHttpBinding } from "./BindingHttp.js";
import { GetCertificate } from "./GetCertificate.js";
export const GetCertificateHttp = Layer.effect(GetCertificate, makeACMPCAHttpBinding({
    action: "GetCertificate",
    operation: acmpca.getCertificate,
}));
//# sourceMappingURL=GetCertificateHttp.js.map