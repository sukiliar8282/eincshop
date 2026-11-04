import * as DynamoDB from "@distilled.cloud/aws/dynamodb";
import * as Layer from "effect/Layer";
import { makeTableHttpBinding } from "./BindingHttp.js";
import { DescribeTable } from "./DescribeTable.js";
export const DescribeTableHttp = Layer.effect(DescribeTable, makeTableHttpBinding({
    tag: "AWS.DynamoDB.DescribeTable",
    operation: DynamoDB.describeTable,
    actions: ["dynamodb:DescribeTable"],
}));
//# sourceMappingURL=DescribeTableHttp.js.map