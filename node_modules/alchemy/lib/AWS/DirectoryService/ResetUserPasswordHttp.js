import * as ds from "@distilled.cloud/aws/directory-service";
import * as Layer from "effect/Layer";
import { makeDirectoryHttpBinding } from "./BindingHttp.js";
import { ResetUserPassword } from "./ResetUserPassword.js";
export const ResetUserPasswordHttp = Layer.effect(ResetUserPassword, makeDirectoryHttpBinding({
    tag: "AWS.DirectoryService.ResetUserPassword",
    operation: ds.resetUserPassword,
    actions: ["ds:ResetUserPassword"],
}));
//# sourceMappingURL=ResetUserPasswordHttp.js.map