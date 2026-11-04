import * as sns from "@distilled.cloud/aws/sns";
import * as Layer from "effect/Layer";
import { makeSnsAccountHttpBinding } from "./BindingHttp.js";
import { ListPlatformApplications } from "./ListPlatformApplications.js";
export const ListPlatformApplicationsHttp = Layer.effect(ListPlatformApplications, makeSnsAccountHttpBinding({
    tag: "AWS.SNS.ListPlatformApplications",
    operation: sns.listPlatformApplications,
    actions: ["sns:ListPlatformApplications"],
}));
//# sourceMappingURL=ListPlatformApplicationsHttp.js.map