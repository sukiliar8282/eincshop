import * as DynamoDB from "@distilled.cloud/aws/dynamodb";
import * as Layer from "effect/Layer";
import * as Output from "../../Output.js";
import { makeTableHttpBinding } from "./BindingHttp.js";
import { Query } from "./Query.js";
export const QueryHttp = Layer.effect(Query, makeTableHttpBinding({
    tag: "AWS.DynamoDB.Query",
    operation: DynamoDB.query,
    actions: ["dynamodb:Query"],
    resources: (table) => [
        table.tableArn,
        Output.interpolate `${table.tableArn}/index/*`,
    ],
}));
//# sourceMappingURL=QueryHttp.js.map