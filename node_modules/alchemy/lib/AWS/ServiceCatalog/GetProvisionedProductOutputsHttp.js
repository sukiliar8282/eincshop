import * as servicecatalog from "@distilled.cloud/aws/service-catalog";
import * as Layer from "effect/Layer";
import { makeServiceCatalogHttpBinding } from "./BindingHttp.js";
import { GetProvisionedProductOutputs } from "./GetProvisionedProductOutputs.js";
export const GetProvisionedProductOutputsHttp = Layer.effect(GetProvisionedProductOutputs, makeServiceCatalogHttpBinding({
    capability: "GetProvisionedProductOutputs",
    iamActions: ["servicecatalog:GetProvisionedProductOutputs"],
    operation: servicecatalog.getProvisionedProductOutputs,
}));
//# sourceMappingURL=GetProvisionedProductOutputsHttp.js.map