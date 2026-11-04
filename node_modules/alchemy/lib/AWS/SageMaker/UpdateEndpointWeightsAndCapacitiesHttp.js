import * as sagemaker from "@distilled.cloud/aws/sagemaker";
import * as Layer from "effect/Layer";
import { makeEndpointHttpBinding } from "./BindingHttp.js";
import { UpdateEndpointWeightsAndCapacities } from "./UpdateEndpointWeightsAndCapacities.js";
export const UpdateEndpointWeightsAndCapacitiesHttp = Layer.effect(UpdateEndpointWeightsAndCapacities, makeEndpointHttpBinding({
    tag: "AWS.SageMaker.UpdateEndpointWeightsAndCapacities",
    operation: sagemaker.updateEndpointWeightsAndCapacities,
    actions: ["sagemaker:UpdateEndpointWeightsAndCapacities"],
}));
//# sourceMappingURL=UpdateEndpointWeightsAndCapacitiesHttp.js.map