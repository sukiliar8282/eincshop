import * as quicksight from "@distilled.cloud/aws/quicksight";
import * as Layer from "effect/Layer";
import { makeQuickSightEmbedHttpBinding } from "./BindingHttp.js";
import { GenerateEmbedUrlForAnonymousUser, } from "./GenerateEmbedUrlForAnonymousUser.js";
export const GenerateEmbedUrlForAnonymousUserHttp = Layer.effect(GenerateEmbedUrlForAnonymousUser, makeQuickSightEmbedHttpBinding({
    tag: "AWS.QuickSight.GenerateEmbedUrlForAnonymousUser",
    operation: quicksight.generateEmbedUrlForAnonymousUser,
    actions: ["quicksight:GenerateEmbedUrlForAnonymousUser"],
    applyDefaults: (request, dashboard) => ({
        ...request,
        Namespace: request?.Namespace ?? "default",
        AuthorizedResourceArns: request?.AuthorizedResourceArns ?? [
            dashboard.arn,
        ],
        ExperienceConfiguration: request?.ExperienceConfiguration ?? {
            Dashboard: { InitialDashboardId: dashboard.dashboardId },
        },
    }),
}));
//# sourceMappingURL=GenerateEmbedUrlForAnonymousUserHttp.js.map