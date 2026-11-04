import * as ecrpublic from "@distilled.cloud/aws/ecr-public";
import * as Layer from "effect/Layer";
import { makePublicRepositoryHttpBinding } from "./BindingHttp.js";
import { PutImage } from "./PutImage.js";
export const PutImageHttp = Layer.effect(PutImage, makePublicRepositoryHttpBinding({
    capability: "PutImage",
    iamActions: ["ecr-public:PutImage"],
    operation: ecrpublic.putImage,
}));
//# sourceMappingURL=PutImageHttp.js.map