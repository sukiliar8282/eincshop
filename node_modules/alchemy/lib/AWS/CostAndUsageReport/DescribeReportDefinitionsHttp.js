import * as cur from "@distilled.cloud/aws/cost-and-usage-report-service";
import * as Layer from "effect/Layer";
import { makeCurHttpBinding } from "./BindingHttp.js";
import { DescribeReportDefinitions } from "./DescribeReportDefinitions.js";
/**
 * HTTP implementation of {@link DescribeReportDefinitions}: grants
 * `cur:DescribeReportDefinitions` on `*` (the API enumerates every report
 * definition in the account) and calls the us-east-1 CUR endpoint with the
 * function's IAM credentials.
 */
export const DescribeReportDefinitionsHttp = Layer.effect(DescribeReportDefinitions, makeCurHttpBinding({
    capability: "DescribeReportDefinitions",
    iamActions: ["cur:DescribeReportDefinitions"],
    operation: cur.describeReportDefinitions,
}));
//# sourceMappingURL=DescribeReportDefinitionsHttp.js.map