import * as inspector2 from "@distilled.cloud/aws/inspector2";
import * as Layer from "effect/Layer";
import { makeInspector2AccountHttpBinding } from "./BindingHttp.js";
import { GetFindingsReportStatus } from "./GetFindingsReportStatus.js";
export const GetFindingsReportStatusHttp = Layer.effect(GetFindingsReportStatus, makeInspector2AccountHttpBinding({
    tag: "AWS.Inspector2.GetFindingsReportStatus",
    operation: inspector2.getFindingsReportStatus,
    actions: ["inspector2:GetFindingsReportStatus"],
}));
//# sourceMappingURL=GetFindingsReportStatusHttp.js.map