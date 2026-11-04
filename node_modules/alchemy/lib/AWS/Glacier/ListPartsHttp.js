import * as glacier from "@distilled.cloud/aws/glacier";
import * as Layer from "effect/Layer";
import { makeGlacierVaultHttpBinding } from "./BindingHttp.js";
import { ListParts } from "./ListParts.js";
export const ListPartsHttp = Layer.effect(ListParts, makeGlacierVaultHttpBinding({
    tag: "AWS.Glacier.ListParts",
    operation: glacier.listParts,
    actions: ["glacier:ListParts"],
}));
//# sourceMappingURL=ListPartsHttp.js.map