import * as backup from "@distilled.cloud/aws/backup";
import * as Layer from "effect/Layer";
import { makeBackupAccountHttpBinding } from "./BindingHttp.js";
import { DescribeProtectedResource } from "./DescribeProtectedResource.js";
export const DescribeProtectedResourceHttp = Layer.effect(DescribeProtectedResource, makeBackupAccountHttpBinding({
    tag: "AWS.Backup.DescribeProtectedResource",
    operation: backup.describeProtectedResource,
    actions: ["backup:DescribeProtectedResource"],
}));
//# sourceMappingURL=DescribeProtectedResourceHttp.js.map