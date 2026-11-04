import * as opensearch from "@distilled.cloud/aws/opensearch";
import * as Layer from "effect/Layer";
import { makeOpenSearchHttpBinding } from "./BindingHttp.js";
import { StartServiceSoftwareUpdate } from "./StartServiceSoftwareUpdate.js";
export const StartServiceSoftwareUpdateHttp = Layer.effect(StartServiceSoftwareUpdate, makeOpenSearchHttpBinding({
    tag: "AWS.OpenSearch.StartServiceSoftwareUpdate",
    operation: opensearch.startServiceSoftwareUpdate,
    actions: ["es:StartServiceSoftwareUpdate"],
}));
//# sourceMappingURL=StartServiceSoftwareUpdateHttp.js.map