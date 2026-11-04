import * as kendra from "@distilled.cloud/aws/kendra";
import * as Layer from "effect/Layer";
import { makeKendraIndexHttpBinding } from "./BindingHttp.js";
import { PutPrincipalMapping } from "./PutPrincipalMapping.js";
export const PutPrincipalMappingHttp = Layer.effect(PutPrincipalMapping, makeKendraIndexHttpBinding({
    tag: "AWS.Kendra.PutPrincipalMapping",
    operation: kendra.putPrincipalMapping,
    actions: ["kendra:PutPrincipalMapping"],
    subResources: ["data-source/*"],
}));
//# sourceMappingURL=PutPrincipalMappingHttp.js.map