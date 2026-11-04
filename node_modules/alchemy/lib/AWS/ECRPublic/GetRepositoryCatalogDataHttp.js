import * as ecrpublic from "@distilled.cloud/aws/ecr-public";
import * as Layer from "effect/Layer";
import { makePublicRepositoryHttpBinding } from "./BindingHttp.js";
import { GetRepositoryCatalogData } from "./GetRepositoryCatalogData.js";
export const GetRepositoryCatalogDataHttp = Layer.effect(GetRepositoryCatalogData, makePublicRepositoryHttpBinding({
    capability: "GetRepositoryCatalogData",
    iamActions: ["ecr-public:GetRepositoryCatalogData"],
    operation: ecrpublic.getRepositoryCatalogData,
}));
//# sourceMappingURL=GetRepositoryCatalogDataHttp.js.map