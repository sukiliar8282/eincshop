import * as quicksight from "@distilled.cloud/aws/quicksight";
import * as Layer from "effect/Layer";
import { makeQuickSightEmbedHttpBinding } from "./BindingHttp.js";
import { GenerateEmbedUrlForRegisteredUser, } from "./GenerateEmbedUrlForRegisteredUser.js";
export const GenerateEmbedUrlForRegisteredUserHttp = Layer.effect(GenerateEmbedUrlForRegisteredUser, makeQuickSightEmbedHttpBinding({
    tag: "AWS.QuickSight.GenerateEmbedUrlForRegisteredUser",
    operation: quicksight.generateEmbedUrlForRegisteredUser,
    actions: ["quicksight:GenerateEmbedUrlForRegisteredUser"],
    applyDefaults: (request, dashboard) => ({
        ...request,
        ExperienceConfiguration: request.ExperienceConfiguration ?? {
            Dashboard: { InitialDashboardId: dashboard.dashboardId },
        },
    }),
}));
//# sourceMappingURL=GenerateEmbedUrlForRegisteredUserHttp.js.map