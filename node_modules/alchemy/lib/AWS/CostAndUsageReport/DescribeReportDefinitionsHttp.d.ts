import * as Layer from "effect/Layer";
import { DescribeReportDefinitions } from "./DescribeReportDefinitions.ts";
/**
 * HTTP implementation of {@link DescribeReportDefinitions}: grants
 * `cur:DescribeReportDefinitions` on `*` (the API enumerates every report
 * definition in the account) and calls the us-east-1 CUR endpoint with the
 * function's IAM credentials.
 */
export declare const DescribeReportDefinitionsHttp: Layer.Layer<DescribeReportDefinitions, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=DescribeReportDefinitionsHttp.d.ts.map