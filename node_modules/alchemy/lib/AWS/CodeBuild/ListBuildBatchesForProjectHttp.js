import * as codebuild from "@distilled.cloud/aws/codebuild";
import * as Layer from "effect/Layer";
import { makeCodeBuildProjectNameHttpBinding } from "./BindingHttp.js";
import { ListBuildBatchesForProject } from "./ListBuildBatchesForProject.js";
export const ListBuildBatchesForProjectHttp = Layer.effect(ListBuildBatchesForProject, makeCodeBuildProjectNameHttpBinding({
    tag: "AWS.CodeBuild.ListBuildBatchesForProject",
    operation: codebuild.listBuildBatchesForProject,
    actions: ["codebuild:ListBuildBatchesForProject"],
}));
//# sourceMappingURL=ListBuildBatchesForProjectHttp.js.map