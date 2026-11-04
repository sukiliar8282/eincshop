import * as acm from "@distilled.cloud/aws/acm";
import * as Layer from "effect/Layer";
import { makeAcmAccountHttpBinding } from "./BindingHttp.js";
import { SearchCertificates, } from "./SearchCertificates.js";
export const SearchCertificatesHttp = Layer.effect(SearchCertificates, makeAcmAccountHttpBinding({
    capability: "SearchCertificates",
    iamActions: ["acm:SearchCertificates"],
    operation: acm.searchCertificates,
}));
//# sourceMappingURL=SearchCertificatesHttp.js.map