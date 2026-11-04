import * as rds from "@distilled.cloud/aws/rds";
import * as Layer from "effect/Layer";
import { makeRdsInstanceHttpBinding } from "./BindingHttp.js";
import { StopDBInstance } from "./StopDBInstance.js";
export const StopDBInstanceHttp = Layer.effect(StopDBInstance, makeRdsInstanceHttpBinding({
    tag: "AWS.RDS.StopDBInstance",
    operation: rds.stopDBInstance,
    actions: ["rds:StopDBInstance"],
}));
//# sourceMappingURL=StopDBInstanceHttp.js.map