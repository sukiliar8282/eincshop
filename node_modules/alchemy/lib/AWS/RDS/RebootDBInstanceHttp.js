import * as rds from "@distilled.cloud/aws/rds";
import * as Layer from "effect/Layer";
import { makeRdsInstanceHttpBinding } from "./BindingHttp.js";
import { RebootDBInstance } from "./RebootDBInstance.js";
export const RebootDBInstanceHttp = Layer.effect(RebootDBInstance, makeRdsInstanceHttpBinding({
    tag: "AWS.RDS.RebootDBInstance",
    operation: rds.rebootDBInstance,
    actions: ["rds:RebootDBInstance"],
}));
//# sourceMappingURL=RebootDBInstanceHttp.js.map