import * as rdsdata from "@distilled.cloud/aws/rds-data";
import * as Layer from "effect/Layer";
import { makeRDSDataHttpBinding } from "./BindingHttp.js";
import { ExecuteSql } from "./ExecuteSql.js";
export const ExecuteSqlHttp = Layer.effect(ExecuteSql, makeRDSDataHttpBinding({
    tag: "AWS.RDSData.ExecuteSql",
    action: "rds-data:ExecuteSql",
    operation: rdsdata.executeSql,
    // the deprecated ExecuteSql API uses legacy wire keys for the same pair
    makeInput: (request, { resourceArn, secretArn, database, schema }) => ({
        ...request,
        dbClusterOrInstanceArn: resourceArn,
        awsSecretStoreArn: secretArn,
        database,
        schema,
    }),
}));
//# sourceMappingURL=ExecuteSqlHttp.js.map