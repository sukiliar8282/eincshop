import * as amplify from "@distilled.cloud/aws/amplify";
import * as Layer from "effect/Layer";
import { makeAmplifyHttpBinding } from "./BindingHttp.js";
import { GenerateAccessLogs } from "./GenerateAccessLogs.js";
export const GenerateAccessLogsHttp = Layer.effect(GenerateAccessLogs, makeAmplifyHttpBinding({
    name: "GenerateAccessLogs",
    operation: amplify.generateAccessLogs,
    actions: ["amplify:GenerateAccessLogs"],
    resources: (app) => [app.appArn],
}));
//# sourceMappingURL=GenerateAccessLogsHttp.js.map