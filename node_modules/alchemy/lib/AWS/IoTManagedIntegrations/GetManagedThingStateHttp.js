import * as mi from "@distilled.cloud/aws/iot-managed-integrations";
import * as Layer from "effect/Layer";
import { makeManagedThingHttpBinding } from "./BindingHttp.js";
import { GetManagedThingState } from "./GetManagedThingState.js";
export const GetManagedThingStateHttp = Layer.effect(GetManagedThingState, makeManagedThingHttpBinding({
    capability: "GetManagedThingState",
    iamActions: ["iotmanagedintegrations:GetManagedThingState"],
    operation: mi.getManagedThingState,
    key: "ManagedThingId",
}));
//# sourceMappingURL=GetManagedThingStateHttp.js.map