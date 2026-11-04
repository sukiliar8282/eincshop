import * as iotfleetwise from "@distilled.cloud/aws/iotfleetwise";
import * as Layer from "effect/Layer";
import { makeFleetWiseResourceHttpBinding } from "./BindingHttp.js";
import { ListDecoderManifestNetworkInterfaces } from "./ListDecoderManifestNetworkInterfaces.js";
export const ListDecoderManifestNetworkInterfacesHttp = Layer.effect(ListDecoderManifestNetworkInterfaces, makeFleetWiseResourceHttpBinding({
    tag: "AWS.IoTFleetWise.ListDecoderManifestNetworkInterfaces",
    operation: iotfleetwise.listDecoderManifestNetworkInterfaces,
    actions: ["iotfleetwise:ListDecoderManifestNetworkInterfaces"],
    requestKey: "name",
    identifier: (decoder) => decoder.decoderManifestName,
    resources: (decoder) => [decoder.decoderManifestArn],
}));
//# sourceMappingURL=ListDecoderManifestNetworkInterfacesHttp.js.map