import * as dms from "@distilled.cloud/aws/database-migration-service";
import * as Layer from "effect/Layer";
import { makeDmsAccountHttpBinding } from "./BindingHttp.js";
import { StopReplication } from "./StopReplication.js";
export const StopReplicationHttp = Layer.effect(StopReplication, makeDmsAccountHttpBinding({
    tag: "AWS.DMS.StopReplication",
    actions: ["dms:StopReplication"],
    operation: dms.stopReplication,
}));
//# sourceMappingURL=StopReplicationHttp.js.map