import * as dms from "@distilled.cloud/aws/database-migration-service";
import * as Layer from "effect/Layer";
import { makeDmsAccountHttpBinding } from "./BindingHttp.js";
import { StartReplication } from "./StartReplication.js";
export const StartReplicationHttp = Layer.effect(StartReplication, makeDmsAccountHttpBinding({
    tag: "AWS.DMS.StartReplication",
    actions: ["dms:StartReplication"],
    operation: dms.startReplication,
}));
//# sourceMappingURL=StartReplicationHttp.js.map