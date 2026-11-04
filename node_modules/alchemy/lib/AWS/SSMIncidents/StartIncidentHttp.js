import * as incidents from "@distilled.cloud/aws/ssm-incidents";
import * as Layer from "effect/Layer";
import { makeIncidentsResponsePlanHttpBinding } from "./BindingHttp.js";
import { StartIncident } from "./StartIncident.js";
export const StartIncidentHttp = Layer.effect(StartIncident, makeIncidentsResponsePlanHttpBinding({
    tag: "AWS.SSMIncidents.StartIncident",
    operation: incidents.startIncident,
    actions: ["ssm-incidents:StartIncident"],
}));
//# sourceMappingURL=StartIncidentHttp.js.map