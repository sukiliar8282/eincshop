import * as servicecatalog from "@distilled.cloud/aws/service-catalog";
import * as Layer from "effect/Layer";
import { makeServiceCatalogHttpBinding } from "./BindingHttp.js";
import { ExecuteProvisionedProductServiceAction } from "./ExecuteProvisionedProductServiceAction.js";
export const ExecuteProvisionedProductServiceActionHttp = Layer.effect(ExecuteProvisionedProductServiceAction, makeServiceCatalogHttpBinding({
    capability: "ExecuteProvisionedProductServiceAction",
    iamActions: ["servicecatalog:ExecuteProvisionedProductServiceAction"],
    operation: servicecatalog.executeProvisionedProductServiceAction,
}));
//# sourceMappingURL=ExecuteProvisionedProductServiceActionHttp.js.map