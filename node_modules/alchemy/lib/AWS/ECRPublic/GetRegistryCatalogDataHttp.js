import * as ecrpublic from "@distilled.cloud/aws/ecr-public";
import * as Layer from "effect/Layer";
import { makePublicRegistryHttpBinding } from "./BindingHttp.js";
import { GetRegistryCatalogData } from "./GetRegistryCatalogData.js";
export const GetRegistryCatalogDataHttp = Layer.effect(GetRegistryCatalogData, makePublicRegistryHttpBinding({
    capability: "GetRegistryCatalogData",
    iamActions: ["ecr-public:GetRegistryCatalogData"],
    operation: ecrpublic.getRegistryCatalogData,
}));
//# sourceMappingURL=GetRegistryCatalogDataHttp.js.map