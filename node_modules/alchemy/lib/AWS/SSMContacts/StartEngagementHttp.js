import * as ssm from "@distilled.cloud/aws/ssm-contacts";
import * as Layer from "effect/Layer";
import { makeContactHttpBinding } from "./BindingHttp.js";
import { StartEngagement } from "./StartEngagement.js";
export const StartEngagementHttp = Layer.effect(StartEngagement, makeContactHttpBinding({
    tag: "AWS.SSMContacts.StartEngagement",
    operation: ssm.startEngagement,
    actions: ["ssm-contacts:StartEngagement"],
}));
//# sourceMappingURL=StartEngagementHttp.js.map