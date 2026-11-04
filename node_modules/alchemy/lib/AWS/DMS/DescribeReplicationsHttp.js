import * as dms from "@distilled.cloud/aws/database-migration-service";
import * as Layer from "effect/Layer";
import { makeDmsAccountHttpBinding } from "./BindingHttp.js";
import { DescribeReplications } from "./DescribeReplications.js";
export const DescribeReplicationsHttp = Layer.effect(DescribeReplications, makeDmsAccountHttpBinding({
    tag: "AWS.DMS.DescribeReplications",
    actions: ["dms:DescribeReplications"],
    operation: dms.describeReplications,
}));
//# sourceMappingURL=DescribeReplicationsHttp.js.map