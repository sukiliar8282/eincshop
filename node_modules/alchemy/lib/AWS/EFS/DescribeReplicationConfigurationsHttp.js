import * as efs from "@distilled.cloud/aws/efs";
import * as Layer from "effect/Layer";
import { makeEfsFileSystemHttpBinding } from "./BindingHttp.js";
import { DescribeReplicationConfigurations } from "./DescribeReplicationConfigurations.js";
export const DescribeReplicationConfigurationsHttp = Layer.effect(DescribeReplicationConfigurations, makeEfsFileSystemHttpBinding({
    tag: "AWS.EFS.DescribeReplicationConfigurations",
    operation: efs.describeReplicationConfigurations,
    actions: ["elasticfilesystem:DescribeReplicationConfigurations"],
}));
//# sourceMappingURL=DescribeReplicationConfigurationsHttp.js.map