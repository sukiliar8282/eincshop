import * as mi from "@distilled.cloud/aws/iot-managed-integrations";
import * as Layer from "effect/Layer";
import { makeManagedThingHttpBinding } from "./BindingHttp.js";
import { GetManagedThingCertificate } from "./GetManagedThingCertificate.js";
export const GetManagedThingCertificateHttp = Layer.effect(GetManagedThingCertificate, makeManagedThingHttpBinding({
    capability: "GetManagedThingCertificate",
    iamActions: ["iotmanagedintegrations:GetManagedThingCertificate"],
    operation: mi.getManagedThingCertificate,
    key: "Identifier",
}));
//# sourceMappingURL=GetManagedThingCertificateHttp.js.map