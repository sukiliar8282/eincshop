import * as docdb from "@distilled.cloud/aws/docdb";
import * as Layer from "effect/Layer";
import { makeDocDBInstanceHttpBinding } from "./BindingHttp.js";
import { RebootDBInstance } from "./RebootDBInstance.js";
export const RebootDBInstanceHttp = Layer.effect(RebootDBInstance, makeDocDBInstanceHttpBinding({
    tag: "AWS.DocDB.RebootDBInstance",
    operation: docdb.rebootDBInstance,
    actions: ["rds:RebootDBInstance"],
}));
//# sourceMappingURL=RebootDBInstanceHttp.js.map