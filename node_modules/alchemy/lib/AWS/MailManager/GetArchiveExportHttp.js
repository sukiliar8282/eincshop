import * as mm from "@distilled.cloud/aws/mailmanager";
import * as Layer from "effect/Layer";
import { makeArchiveTaskHttpBinding } from "./BindingHttp.js";
import { GetArchiveExport } from "./GetArchiveExport.js";
export const GetArchiveExportHttp = Layer.effect(GetArchiveExport, makeArchiveTaskHttpBinding({
    tag: "AWS.MailManager.GetArchiveExport",
    operation: mm.getArchiveExport,
    actions: ["ses:GetArchiveExport"],
}));
//# sourceMappingURL=GetArchiveExportHttp.js.map