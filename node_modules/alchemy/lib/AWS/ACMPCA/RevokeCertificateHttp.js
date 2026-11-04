import * as acmpca from "@distilled.cloud/aws/acm-pca";
import * as Layer from "effect/Layer";
import { makeACMPCAHttpBinding } from "./BindingHttp.js";
import { RevokeCertificate } from "./RevokeCertificate.js";
export const RevokeCertificateHttp = Layer.effect(RevokeCertificate, makeACMPCAHttpBinding({
    action: "RevokeCertificate",
    operation: acmpca.revokeCertificate,
}));
//# sourceMappingURL=RevokeCertificateHttp.js.map