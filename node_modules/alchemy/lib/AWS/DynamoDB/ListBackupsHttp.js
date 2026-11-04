import * as DynamoDB from "@distilled.cloud/aws/dynamodb";
import * as Layer from "effect/Layer";
import { makeTableHttpBinding } from "./BindingHttp.js";
import { ListBackups } from "./ListBackups.js";
export const ListBackupsHttp = Layer.effect(ListBackups, makeTableHttpBinding({
    tag: "AWS.DynamoDB.ListBackups",
    operation: DynamoDB.listBackups,
    actions: ["dynamodb:ListBackups"],
    // ListBackups does not support resource-level permissions (the runtime
    // callable still scopes results to the bound table via TableName).
    resources: () => ["*"],
}));
//# sourceMappingURL=ListBackupsHttp.js.map