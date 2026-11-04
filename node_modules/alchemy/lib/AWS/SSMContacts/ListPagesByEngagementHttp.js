import * as ssm from "@distilled.cloud/aws/ssm-contacts";
import * as Layer from "effect/Layer";
import { makeAccountHttpBinding } from "./BindingHttp.js";
import { ListPagesByEngagement } from "./ListPagesByEngagement.js";
export const ListPagesByEngagementHttp = Layer.effect(ListPagesByEngagement, makeAccountHttpBinding({
    tag: "AWS.SSMContacts.ListPagesByEngagement",
    operation: ssm.listPagesByEngagement,
    actions: ["ssm-contacts:ListPagesByEngagement"],
}));
//# sourceMappingURL=ListPagesByEngagementHttp.js.map