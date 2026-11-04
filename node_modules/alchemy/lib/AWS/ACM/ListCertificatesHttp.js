import * as acm from "@distilled.cloud/aws/acm";
import * as Layer from "effect/Layer";
import { makeAcmAccountHttpBinding } from "./BindingHttp.js";
import { ListCertificates, } from "./ListCertificates.js";
export const ListCertificatesHttp = Layer.effect(ListCertificates, makeAcmAccountHttpBinding({
    capability: "ListCertificates",
    iamActions: ["acm:ListCertificates"],
    operation: acm.listCertificates,
}));
//# sourceMappingURL=ListCertificatesHttp.js.map