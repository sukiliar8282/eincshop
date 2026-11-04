import * as ssm from "@distilled.cloud/aws/ssm-contacts";
import * as Layer from "effect/Layer";
import { makeAccountHttpBinding } from "./BindingHttp.js";
import { StopEngagement } from "./StopEngagement.js";
export const StopEngagementHttp = Layer.effect(StopEngagement, makeAccountHttpBinding({
    tag: "AWS.SSMContacts.StopEngagement",
    operation: ssm.stopEngagement,
    actions: ["ssm-contacts:StopEngagement"],
}));
//# sourceMappingURL=StopEngagementHttp.js.map