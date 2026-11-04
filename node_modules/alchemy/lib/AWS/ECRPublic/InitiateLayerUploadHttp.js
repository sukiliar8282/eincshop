import * as ecrpublic from "@distilled.cloud/aws/ecr-public";
import * as Layer from "effect/Layer";
import { makePublicRepositoryHttpBinding } from "./BindingHttp.js";
import { InitiateLayerUpload } from "./InitiateLayerUpload.js";
export const InitiateLayerUploadHttp = Layer.effect(InitiateLayerUpload, makePublicRepositoryHttpBinding({
    capability: "InitiateLayerUpload",
    iamActions: ["ecr-public:InitiateLayerUpload"],
    operation: ecrpublic.initiateLayerUpload,
}));
//# sourceMappingURL=InitiateLayerUploadHttp.js.map