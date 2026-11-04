import * as dms from "@distilled.cloud/aws/database-migration-service";
import * as Layer from "effect/Layer";
import { makeDmsAccountHttpBinding } from "./BindingHttp.js";
import { StartReplicationTask } from "./StartReplicationTask.js";
export const StartReplicationTaskHttp = Layer.effect(StartReplicationTask, makeDmsAccountHttpBinding({
    tag: "AWS.DMS.StartReplicationTask",
    actions: ["dms:StartReplicationTask"],
    operation: dms.startReplicationTask,
}));
//# sourceMappingURL=StartReplicationTaskHttp.js.map