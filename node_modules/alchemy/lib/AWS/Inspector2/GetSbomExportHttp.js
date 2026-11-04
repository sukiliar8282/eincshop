import * as inspector2 from "@distilled.cloud/aws/inspector2";
import * as Layer from "effect/Layer";
import { makeInspector2AccountHttpBinding } from "./BindingHttp.js";
import { GetSbomExport } from "./GetSbomExport.js";
export const GetSbomExportHttp = Layer.effect(GetSbomExport, makeInspector2AccountHttpBinding({
    tag: "AWS.Inspector2.GetSbomExport",
    operation: inspector2.getSbomExport,
    actions: ["inspector2:GetSbomExport"],
}));
//# sourceMappingURL=GetSbomExportHttp.js.map