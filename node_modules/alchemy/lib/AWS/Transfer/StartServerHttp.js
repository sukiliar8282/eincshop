import * as transfer from "@distilled.cloud/aws/transfer";
import * as Layer from "effect/Layer";
import { makeTransferServerHttpBinding } from "./BindingHttp.js";
import { StartServer } from "./StartServer.js";
export const StartServerHttp = Layer.effect(StartServer, makeTransferServerHttpBinding({
    tag: "AWS.Transfer.StartServer",
    operation: transfer.startServer,
    actions: ["transfer:StartServer"],
}));
//# sourceMappingURL=StartServerHttp.js.map