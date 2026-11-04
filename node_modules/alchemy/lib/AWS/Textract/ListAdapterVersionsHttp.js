import * as textract from "@distilled.cloud/aws/textract";
import * as Layer from "effect/Layer";
import { makeTextractAdapterHttpBinding } from "./BindingHttp.js";
import { ListAdapterVersions } from "./ListAdapterVersions.js";
export const ListAdapterVersionsHttp = Layer.effect(ListAdapterVersions, makeTextractAdapterHttpBinding({
    capability: "ListAdapterVersions",
    iamActions: ["textract:ListAdapterVersions"],
    operation: textract.listAdapterVersions,
}));
//# sourceMappingURL=ListAdapterVersionsHttp.js.map