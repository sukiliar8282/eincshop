import * as ssm from "@distilled.cloud/aws/ssm-contacts";
import * as Layer from "effect/Layer";
import { makeAccountHttpBinding } from "./BindingHttp.js";
import { ListPageReceipts } from "./ListPageReceipts.js";
export const ListPageReceiptsHttp = Layer.effect(ListPageReceipts, makeAccountHttpBinding({
    tag: "AWS.SSMContacts.ListPageReceipts",
    operation: ssm.listPageReceipts,
    actions: ["ssm-contacts:ListPageReceipts"],
}));
//# sourceMappingURL=ListPageReceiptsHttp.js.map