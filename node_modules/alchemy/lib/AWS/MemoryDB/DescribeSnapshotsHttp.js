import * as memorydb from "@distilled.cloud/aws/memorydb";
import * as Layer from "effect/Layer";
import { makeMemoryDBAccountHttpBinding } from "./BindingHttp.js";
import { DescribeSnapshots } from "./DescribeSnapshots.js";
export const DescribeSnapshotsHttp = Layer.effect(DescribeSnapshots, makeMemoryDBAccountHttpBinding({
    tag: "AWS.MemoryDB.DescribeSnapshots",
    operation: memorydb.describeSnapshots,
    actions: ["memorydb:DescribeSnapshots"],
}));
//# sourceMappingURL=DescribeSnapshotsHttp.js.map