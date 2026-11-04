import * as rdsdata from "@distilled.cloud/aws/rds-data";
import * as Layer from "effect/Layer";
import { makeRDSDataHttpBinding } from "./BindingHttp.js";
import { RollbackTransaction, } from "./RollbackTransaction.js";
export const RollbackTransactionHttp = Layer.effect(RollbackTransaction, makeRDSDataHttpBinding({
    tag: "AWS.RDSData.RollbackTransaction",
    action: "rds-data:RollbackTransaction",
    operation: rdsdata.rollbackTransaction,
    // rollback is transaction-scoped — no database/schema on the wire
    makeInput: (request, { resourceArn, secretArn }) => ({
        ...request,
        resourceArn,
        secretArn,
    }),
}));
//# sourceMappingURL=RollbackTransactionHttp.js.map