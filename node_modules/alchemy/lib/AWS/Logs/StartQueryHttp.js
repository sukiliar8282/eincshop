import * as Logs from "@distilled.cloud/aws/cloudwatch-logs";
import * as Layer from "effect/Layer";
import { makeLogGroupHttpBinding } from "./BindingHttp.js";
import { StartQuery } from "./StartQuery.js";
export const StartQueryHttp = Layer.effect(StartQuery, makeLogGroupHttpBinding({
    tag: "AWS.Logs.StartQuery",
    operation: Logs.startQuery,
    // logs:StopQuery is deliberately NOT bundled here: it does not support
    // resource-level permissions, so a group-scoped grant never matches.
    // Use the dedicated StopQuery binding (which grants on `*`).
    actions: ["logs:StartQuery"],
}));
//# sourceMappingURL=StartQueryHttp.js.map