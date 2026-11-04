import * as rds from "@distilled.cloud/aws/rds";
import * as Layer from "effect/Layer";
import { makeRdsInstanceHttpBinding } from "./BindingHttp.js";
import { StartDBInstance } from "./StartDBInstance.js";
export const StartDBInstanceHttp = Layer.effect(StartDBInstance, makeRdsInstanceHttpBinding({
    tag: "AWS.RDS.StartDBInstance",
    operation: rds.startDBInstance,
    actions: ["rds:StartDBInstance"],
}));
//# sourceMappingURL=StartDBInstanceHttp.js.map