import * as kvam from "@distilled.cloud/aws/kinesis-video-archived-media";
import * as Layer from "effect/Layer";
import { makeStreamMediaHttpBinding } from "./BindingHttp.js";
import { ListFragments } from "./ListFragments.js";
export const ListFragmentsHttp = Layer.effect(ListFragments, makeStreamMediaHttpBinding({
    tag: "AWS.KinesisVideo.ListFragments",
    apiName: "LIST_FRAGMENTS",
    actions: ["kinesisvideo:ListFragments"],
    operation: kvam.listFragments,
}));
//# sourceMappingURL=ListFragmentsHttp.js.map