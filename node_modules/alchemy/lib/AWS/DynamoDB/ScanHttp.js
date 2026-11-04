import * as DynamoDB from "@distilled.cloud/aws/dynamodb";
import * as Layer from "effect/Layer";
import * as Output from "../../Output.js";
import { makeTableHttpBinding } from "./BindingHttp.js";
import { Scan } from "./Scan.js";
export const ScanHttp = Layer.effect(Scan, makeTableHttpBinding({
    tag: "AWS.DynamoDB.Scan",
    operation: DynamoDB.scan,
    actions: ["dynamodb:Scan"],
    resources: (table) => [
        table.tableArn,
        Output.interpolate `${table.tableArn}/index/*`,
    ],
}));
//# sourceMappingURL=ScanHttp.js.map