import * as mm from "@distilled.cloud/aws/mailmanager";
import * as Layer from "effect/Layer";
import { makeArchiveTaskHttpBinding } from "./BindingHttp.js";
import { StopArchiveExport } from "./StopArchiveExport.js";
export const StopArchiveExportHttp = Layer.effect(StopArchiveExport, makeArchiveTaskHttpBinding({
    tag: "AWS.MailManager.StopArchiveExport",
    operation: mm.stopArchiveExport,
    actions: ["ses:StopArchiveExport"],
}));
//# sourceMappingURL=StopArchiveExportHttp.js.map