import * as servicequotas from "@distilled.cloud/aws/service-quotas";
import * as Layer from "effect/Layer";
import { makeServiceQuotasHttpBinding } from "./BindingHttp.js";
import { GetAutoManagementConfiguration } from "./GetAutoManagementConfiguration.js";
export const GetAutoManagementConfigurationHttp = Layer.effect(GetAutoManagementConfiguration, makeServiceQuotasHttpBinding({
    capability: "GetAutoManagementConfiguration",
    iamActions: ["servicequotas:GetAutoManagementConfiguration"],
    operation: servicequotas.getAutoManagementConfiguration,
}));
//# sourceMappingURL=GetAutoManagementConfigurationHttp.js.map