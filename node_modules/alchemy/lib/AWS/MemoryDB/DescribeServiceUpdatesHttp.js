import * as memorydb from "@distilled.cloud/aws/memorydb";
import * as Layer from "effect/Layer";
import { makeMemoryDBAccountHttpBinding } from "./BindingHttp.js";
import { DescribeServiceUpdates } from "./DescribeServiceUpdates.js";
export const DescribeServiceUpdatesHttp = Layer.effect(DescribeServiceUpdates, makeMemoryDBAccountHttpBinding({
    tag: "AWS.MemoryDB.DescribeServiceUpdates",
    operation: memorydb.describeServiceUpdates,
    actions: ["memorydb:DescribeServiceUpdates"],
}));
//# sourceMappingURL=DescribeServiceUpdatesHttp.js.map