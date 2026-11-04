import * as incidents from "@distilled.cloud/aws/ssm-incidents";
import * as Layer from "effect/Layer";
import { makeIncidentsAccountHttpBinding } from "./BindingHttp.js";
import { ListIncidentFindings } from "./ListIncidentFindings.js";
export const ListIncidentFindingsHttp = Layer.effect(ListIncidentFindings, makeIncidentsAccountHttpBinding({
    tag: "AWS.SSMIncidents.ListIncidentFindings",
    operation: incidents.listIncidentFindings,
    actions: ["ssm-incidents:ListIncidentFindings"],
}));
//# sourceMappingURL=ListIncidentFindingsHttp.js.map