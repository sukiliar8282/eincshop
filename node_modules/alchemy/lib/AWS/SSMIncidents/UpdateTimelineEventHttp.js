import * as incidents from "@distilled.cloud/aws/ssm-incidents";
import * as Layer from "effect/Layer";
import { makeIncidentsAccountHttpBinding } from "./BindingHttp.js";
import { UpdateTimelineEvent } from "./UpdateTimelineEvent.js";
export const UpdateTimelineEventHttp = Layer.effect(UpdateTimelineEvent, makeIncidentsAccountHttpBinding({
    tag: "AWS.SSMIncidents.UpdateTimelineEvent",
    operation: incidents.updateTimelineEvent,
    actions: ["ssm-incidents:UpdateTimelineEvent"],
}));
//# sourceMappingURL=UpdateTimelineEventHttp.js.map