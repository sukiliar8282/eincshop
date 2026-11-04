import * as dms from "@distilled.cloud/aws/database-migration-service";
import * as Layer from "effect/Layer";
import { makeDmsAccountHttpBinding } from "./BindingHttp.js";
import { DescribeReplicationTasks } from "./DescribeReplicationTasks.js";
export const DescribeReplicationTasksHttp = Layer.effect(DescribeReplicationTasks, makeDmsAccountHttpBinding({
    tag: "AWS.DMS.DescribeReplicationTasks",
    actions: ["dms:DescribeReplicationTasks"],
    operation: dms.describeReplicationTasks,
}));
//# sourceMappingURL=DescribeReplicationTasksHttp.js.map