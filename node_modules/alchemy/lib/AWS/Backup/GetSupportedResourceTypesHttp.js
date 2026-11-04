import * as backup from "@distilled.cloud/aws/backup";
import * as Layer from "effect/Layer";
import { makeBackupAccountHttpBinding } from "./BindingHttp.js";
import { GetSupportedResourceTypes } from "./GetSupportedResourceTypes.js";
export const GetSupportedResourceTypesHttp = Layer.effect(GetSupportedResourceTypes, makeBackupAccountHttpBinding({
    tag: "AWS.Backup.GetSupportedResourceTypes",
    operation: backup.getSupportedResourceTypes,
    actions: ["backup:GetSupportedResourceTypes"],
}));
//# sourceMappingURL=GetSupportedResourceTypesHttp.js.map