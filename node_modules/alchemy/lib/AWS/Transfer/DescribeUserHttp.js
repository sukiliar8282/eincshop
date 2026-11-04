import * as transfer from "@distilled.cloud/aws/transfer";
import * as Layer from "effect/Layer";
import { makeTransferUserHttpBinding } from "./BindingHttp.js";
import { DescribeUser } from "./DescribeUser.js";
export const DescribeUserHttp = Layer.effect(DescribeUser, makeTransferUserHttpBinding({
    tag: "AWS.Transfer.DescribeUser",
    operation: transfer.describeUser,
    actions: ["transfer:DescribeUser"],
}));
//# sourceMappingURL=DescribeUserHttp.js.map