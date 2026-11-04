import * as incidents from "@distilled.cloud/aws/ssm-incidents";
import * as Layer from "effect/Layer";
import { makeIncidentsAccountHttpBinding } from "./BindingHttp.js";
import { GetTimelineEvent } from "./GetTimelineEvent.js";
export const GetTimelineEventHttp = Layer.effect(GetTimelineEvent, makeIncidentsAccountHttpBinding({
    tag: "AWS.SSMIncidents.GetTimelineEvent",
    operation: incidents.getTimelineEvent,
    actions: ["ssm-incidents:GetTimelineEvent"],
}));
//# sourceMappingURL=GetTimelineEventHttp.js.map