import * as backup from "@distilled.cloud/aws/backup";
import * as Layer from "effect/Layer";
import { makeBackupAccountHttpBinding } from "./BindingHttp.js";
import { ListProtectedResources } from "./ListProtectedResources.js";
export const ListProtectedResourcesHttp = Layer.effect(ListProtectedResources, makeBackupAccountHttpBinding({
    tag: "AWS.Backup.ListProtectedResources",
    operation: backup.listProtectedResources,
    actions: ["backup:ListProtectedResources"],
}));
//# sourceMappingURL=ListProtectedResourcesHttp.js.map