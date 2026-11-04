import * as memorydb from "@distilled.cloud/aws/memorydb";
import * as Layer from "effect/Layer";
import { makeMemoryDBClusterHttpBinding } from "./BindingHttp.js";
import { FailoverShard } from "./FailoverShard.js";
export const FailoverShardHttp = Layer.effect(FailoverShard, makeMemoryDBClusterHttpBinding({
    tag: "AWS.MemoryDB.FailoverShard",
    operation: memorydb.failoverShard,
    actions: ["memorydb:FailoverShard"],
}));
//# sourceMappingURL=FailoverShardHttp.js.map