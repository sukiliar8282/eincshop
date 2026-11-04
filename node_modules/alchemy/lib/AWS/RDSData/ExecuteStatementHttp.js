import * as rdsdata from "@distilled.cloud/aws/rds-data";
import * as Layer from "effect/Layer";
import { makeRDSDataHttpBinding } from "./BindingHttp.js";
import { ExecuteStatement, } from "./ExecuteStatement.js";
export const ExecuteStatementHttp = Layer.effect(ExecuteStatement, makeRDSDataHttpBinding({
    tag: "AWS.RDSData.ExecuteStatement",
    action: "rds-data:ExecuteStatement",
    operation: rdsdata.executeStatement,
    makeInput: (request, { resourceArn, secretArn, database, schema }) => ({
        ...request,
        resourceArn,
        secretArn,
        database,
        schema,
    }),
}));
//# sourceMappingURL=ExecuteStatementHttp.js.map