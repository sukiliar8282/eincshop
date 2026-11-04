import * as dms from "@distilled.cloud/aws/database-migration-service";
import * as Layer from "effect/Layer";
import { makeDmsAccountHttpBinding } from "./BindingHttp.js";
import { DescribeTableStatistics } from "./DescribeTableStatistics.js";
export const DescribeTableStatisticsHttp = Layer.effect(DescribeTableStatistics, makeDmsAccountHttpBinding({
    tag: "AWS.DMS.DescribeTableStatistics",
    actions: ["dms:DescribeTableStatistics"],
    operation: dms.describeTableStatistics,
}));
//# sourceMappingURL=DescribeTableStatisticsHttp.js.map