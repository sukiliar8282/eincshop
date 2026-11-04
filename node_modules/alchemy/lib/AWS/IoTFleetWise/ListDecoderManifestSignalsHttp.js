import * as iotfleetwise from "@distilled.cloud/aws/iotfleetwise";
import * as Layer from "effect/Layer";
import { makeFleetWiseResourceHttpBinding } from "./BindingHttp.js";
import { ListDecoderManifestSignals } from "./ListDecoderManifestSignals.js";
export const ListDecoderManifestSignalsHttp = Layer.effect(ListDecoderManifestSignals, makeFleetWiseResourceHttpBinding({
    tag: "AWS.IoTFleetWise.ListDecoderManifestSignals",
    operation: iotfleetwise.listDecoderManifestSignals,
    actions: ["iotfleetwise:ListDecoderManifestSignals"],
    requestKey: "name",
    identifier: (decoder) => decoder.decoderManifestName,
    resources: (decoder) => [decoder.decoderManifestArn],
}));
//# sourceMappingURL=ListDecoderManifestSignalsHttp.js.map