import * as neptune from "@distilled.cloud/aws/neptune";
import * as Layer from "effect/Layer";
import { makeNeptuneInstanceHttpBinding } from "./BindingHttp.js";
import { RebootDBInstance } from "./RebootDBInstance.js";
export const RebootDBInstanceHttp = Layer.effect(RebootDBInstance, makeNeptuneInstanceHttpBinding({
    tag: "AWS.Neptune.RebootDBInstance",
    operation: neptune.rebootDBInstance,
    actions: ["rds:RebootDBInstance"],
}));
//# sourceMappingURL=RebootDBInstanceHttp.js.map