import * as incidents from "@distilled.cloud/aws/ssm-incidents";
import * as Layer from "effect/Layer";
import { makeIncidentsAccountHttpBinding } from "./BindingHttp.js";
import { UpdateIncidentRecord } from "./UpdateIncidentRecord.js";
export const UpdateIncidentRecordHttp = Layer.effect(UpdateIncidentRecord, makeIncidentsAccountHttpBinding({
    tag: "AWS.SSMIncidents.UpdateIncidentRecord",
    operation: incidents.updateIncidentRecord,
    actions: ["ssm-incidents:UpdateIncidentRecord"],
}));
//# sourceMappingURL=UpdateIncidentRecordHttp.js.map