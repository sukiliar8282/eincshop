import * as SSM from "@distilled.cloud/aws/ssm";
import * as Layer from "effect/Layer";
import { makeParameterHttpBinding } from "./BindingHttp.js";
import { UnlabelParameterVersion } from "./UnlabelParameterVersion.js";
export const UnlabelParameterVersionHttp = Layer.effect(UnlabelParameterVersion, makeParameterHttpBinding({
    tag: "AWS.SSM.UnlabelParameterVersion",
    operation: SSM.unlabelParameterVersion,
    actions: ["ssm:UnlabelParameterVersion"],
}));
//# sourceMappingURL=UnlabelParameterVersionHttp.js.map