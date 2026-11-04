import * as codebuild from "@distilled.cloud/aws/codebuild";
import * as Layer from "effect/Layer";
import { makeCodeBuildProjectNameHttpBinding } from "./BindingHttp.js";
import { InvalidateProjectCache } from "./InvalidateProjectCache.js";
export const InvalidateProjectCacheHttp = Layer.effect(InvalidateProjectCache, makeCodeBuildProjectNameHttpBinding({
    tag: "AWS.CodeBuild.InvalidateProjectCache",
    operation: codebuild.invalidateProjectCache,
    actions: ["codebuild:InvalidateProjectCache"],
}));
//# sourceMappingURL=InvalidateProjectCacheHttp.js.map