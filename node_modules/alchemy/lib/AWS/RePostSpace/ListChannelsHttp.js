import * as repostspace from "@distilled.cloud/aws/repostspace";
import * as Layer from "effect/Layer";
import { makeRePostSpaceHttpBinding } from "./BindingHttp.js";
import { ListChannels } from "./ListChannels.js";
export const ListChannelsHttp = Layer.effect(ListChannels, makeRePostSpaceHttpBinding({
    tag: "AWS.RePostSpace.ListChannels",
    operation: repostspace.listChannels,
    actions: ["repostspace:ListChannels"],
}));
//# sourceMappingURL=ListChannelsHttp.js.map