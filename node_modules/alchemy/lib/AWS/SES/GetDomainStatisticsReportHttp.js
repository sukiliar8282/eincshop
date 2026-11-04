import * as sesv2 from "@distilled.cloud/aws/sesv2";
import * as Layer from "effect/Layer";
import { makeSESHttpBinding } from "./BindingHttp.js";
import { GetDomainStatisticsReport } from "./GetDomainStatisticsReport.js";
export const GetDomainStatisticsReportHttp = Layer.effect(GetDomainStatisticsReport, makeSESHttpBinding({
    tag: "AWS.SES.GetDomainStatisticsReport",
    operation: sesv2.getDomainStatisticsReport,
    actions: ["ses:GetDomainStatisticsReport"],
}));
//# sourceMappingURL=GetDomainStatisticsReportHttp.js.map