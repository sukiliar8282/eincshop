import * as DynamoDB from "@distilled.cloud/aws/dynamodb";
import * as Layer from "effect/Layer";
import * as Output from "../../Output.js";
import { makeTableIamHttpBinding } from "./BindingHttp.js";
import { ExecuteStatement } from "./ExecuteStatement.js";
export const ExecuteStatementHttp = Layer.effect(ExecuteStatement, makeTableIamHttpBinding({
    tag: "AWS.DynamoDB.ExecuteStatement",
    operation: DynamoDB.executeStatement,
    actions: [
        "dynamodb:PartiQLDelete",
        "dynamodb:PartiQLInsert",
        "dynamodb:PartiQLSelect",
        "dynamodb:PartiQLUpdate",
    ],
    resources: (table) => [
        table.tableArn,
        Output.interpolate `${table.tableArn}/index/*`,
    ],
}));
//# sourceMappingURL=ExecuteStatementHttp.js.map