import * as ga from "@distilled.cloud/aws/global-accelerator";
import * as Layer from "effect/Layer";
import { makeGaEndpointGroupHttpBinding } from "./BindingHttp.js";
import { RemoveEndpoints } from "./RemoveEndpoints.js";
export const RemoveEndpointsHttp = Layer.effect(RemoveEndpoints, makeGaEndpointGroupHttpBinding({
    tag: "AWS.GlobalAccelerator.RemoveEndpoints",
    operation: ga.removeEndpoints,
    // Like AddEndpoints, Global Accelerator authorizes endpoint removal as
    // an update to the endpoint group, so both actions are required.
    actions: [
        "globalaccelerator:RemoveEndpoints",
        "globalaccelerator:UpdateEndpointGroup",
    ],
}));
//# sourceMappingURL=RemoveEndpointsHttp.js.map