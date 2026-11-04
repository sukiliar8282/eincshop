import * as dms from "@distilled.cloud/aws/database-migration-service";
import * as Layer from "effect/Layer";
import { makeDmsAccountHttpBinding } from "./BindingHttp.js";
import { StopReplicationTask } from "./StopReplicationTask.js";
export const StopReplicationTaskHttp = Layer.effect(StopReplicationTask, makeDmsAccountHttpBinding({
    tag: "AWS.DMS.StopReplicationTask",
    actions: ["dms:StopReplicationTask"],
    operation: dms.stopReplicationTask,
}));
//# sourceMappingURL=StopReplicationTaskHttp.js.map