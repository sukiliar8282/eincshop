import * as obs from "@distilled.cloud/aws/observabilityadmin";
import * as Layer from "effect/Layer";
import { makeObservabilityAdminHttpBinding } from "./BindingHttp.js";
import { GetTelemetryEvaluationStatus } from "./GetTelemetryEvaluationStatus.js";
export const GetTelemetryEvaluationStatusHttp = Layer.effect(GetTelemetryEvaluationStatus, makeObservabilityAdminHttpBinding({
    capability: "GetTelemetryEvaluationStatus",
    iamActions: ["observabilityadmin:GetTelemetryEvaluationStatus"],
    operation: obs.getTelemetryEvaluationStatus,
}));
//# sourceMappingURL=GetTelemetryEvaluationStatusHttp.js.map