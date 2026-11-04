import * as ds from "@distilled.cloud/aws/directory-service";
import * as Layer from "effect/Layer";
import { makeDirectoryHttpBinding } from "./BindingHttp.js";
import { DescribeSnapshots } from "./DescribeSnapshots.js";
export const DescribeSnapshotsHttp = Layer.effect(DescribeSnapshots, makeDirectoryHttpBinding({
    tag: "AWS.DirectoryService.DescribeSnapshots",
    operation: ds.describeSnapshots,
    actions: ["ds:DescribeSnapshots"],
}));
//# sourceMappingURL=DescribeSnapshotsHttp.js.map