import * as acm from "@distilled.cloud/aws/acm";
import * as Layer from "effect/Layer";
import { makeAcmAccountHttpBinding } from "./BindingHttp.js";
import { ImportCertificate, } from "./ImportCertificate.js";
export const ImportCertificateHttp = Layer.effect(ImportCertificate, makeAcmAccountHttpBinding({
    capability: "ImportCertificate",
    // Importing with `Tags` additionally requires `acm:AddTagsToCertificate`,
    // which ACM checks alongside the import itself.
    iamActions: ["acm:ImportCertificate", "acm:AddTagsToCertificate"],
    operation: acm.importCertificate,
}));
//# sourceMappingURL=ImportCertificateHttp.js.map