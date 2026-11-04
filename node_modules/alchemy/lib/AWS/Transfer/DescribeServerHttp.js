import * as transfer from "@distilled.cloud/aws/transfer";
import * as Layer from "effect/Layer";
import { makeTransferServerHttpBinding } from "./BindingHttp.js";
import { DescribeServer } from "./DescribeServer.js";
export const DescribeServerHttp = Layer.effect(DescribeServer, makeTransferServerHttpBinding({
    tag: "AWS.Transfer.DescribeServer",
    operation: transfer.describeServer,
    actions: ["transfer:DescribeServer"],
}));
//# sourceMappingURL=DescribeServerHttp.js.map