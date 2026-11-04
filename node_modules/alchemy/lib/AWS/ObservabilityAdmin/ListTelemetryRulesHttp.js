import * as obs from "@distilled.cloud/aws/observabilityadmin";
import * as Layer from "effect/Layer";
import { makeObservabilityAdminHttpBinding } from "./BindingHttp.js";
import { ListTelemetryRules } from "./ListTelemetryRules.js";
export const ListTelemetryRulesHttp = Layer.effect(ListTelemetryRules, makeObservabilityAdminHttpBinding({
    capability: "ListTelemetryRules",
    iamActions: ["observabilityadmin:ListTelemetryRules"],
    operation: obs.listTelemetryRules,
}));
//# sourceMappingURL=ListTelemetryRulesHttp.js.map