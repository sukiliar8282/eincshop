import * as mm from "@distilled.cloud/aws/mailmanager";
import * as Layer from "effect/Layer";
import { makeArchiveHttpBinding } from "./BindingHttp.js";
import { StartArchiveExport } from "./StartArchiveExport.js";
export const StartArchiveExportHttp = Layer.effect(StartArchiveExport, makeArchiveHttpBinding({
    tag: "AWS.MailManager.StartArchiveExport",
    operation: mm.startArchiveExport,
    actions: ["ses:StartArchiveExport"],
}));
//# sourceMappingURL=StartArchiveExportHttp.js.map