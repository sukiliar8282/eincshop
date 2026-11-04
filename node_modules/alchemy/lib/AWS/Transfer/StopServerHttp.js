import * as transfer from "@distilled.cloud/aws/transfer";
import * as Layer from "effect/Layer";
import { makeTransferServerHttpBinding } from "./BindingHttp.js";
import { StopServer } from "./StopServer.js";
export const StopServerHttp = Layer.effect(StopServer, makeTransferServerHttpBinding({
    tag: "AWS.Transfer.StopServer",
    operation: transfer.stopServer,
    actions: ["transfer:StopServer"],
}));
//# sourceMappingURL=StopServerHttp.js.map