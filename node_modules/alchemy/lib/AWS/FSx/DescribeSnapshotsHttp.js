import * as fsx from "@distilled.cloud/aws/fsx";
import * as Layer from "effect/Layer";
import { makeFSxAccountHttpBinding } from "./BindingHttp.js";
import { DescribeSnapshots } from "./DescribeSnapshots.js";
export const DescribeSnapshotsHttp = Layer.effect(DescribeSnapshots, makeFSxAccountHttpBinding({
    tag: "AWS.FSx.DescribeSnapshots",
    operation: fsx.describeSnapshots,
    actions: ["fsx:DescribeSnapshots"],
}));
//# sourceMappingURL=DescribeSnapshotsHttp.js.map