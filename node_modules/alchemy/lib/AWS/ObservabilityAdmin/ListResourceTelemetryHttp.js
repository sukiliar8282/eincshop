import * as obs from "@distilled.cloud/aws/observabilityadmin";
import * as Layer from "effect/Layer";
import { makeObservabilityAdminHttpBinding } from "./BindingHttp.js";
import { ListResourceTelemetry } from "./ListResourceTelemetry.js";
export const ListResourceTelemetryHttp = Layer.effect(ListResourceTelemetry, makeObservabilityAdminHttpBinding({
    capability: "ListResourceTelemetry",
    iamActions: ["observabilityadmin:ListResourceTelemetry"],
    operation: obs.listResourceTelemetry,
}));
//# sourceMappingURL=ListResourceTelemetryHttp.js.map