import * as mi from "@distilled.cloud/aws/iot-managed-integrations";
import * as Layer from "effect/Layer";
import { makeManagedThingHttpBinding } from "./BindingHttp.js";
import { SendManagedThingCommand } from "./SendManagedThingCommand.js";
export const SendManagedThingCommandHttp = Layer.effect(SendManagedThingCommand, makeManagedThingHttpBinding({
    capability: "SendManagedThingCommand",
    iamActions: ["iotmanagedintegrations:SendManagedThingCommand"],
    operation: mi.sendManagedThingCommand,
    key: "ManagedThingId",
}));
//# sourceMappingURL=SendManagedThingCommandHttp.js.map