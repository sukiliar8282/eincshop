import * as dataexchange from "@distilled.cloud/aws/dataexchange";
import * as Layer from "effect/Layer";
import { makeRevisionHttpBinding } from "./BindingHttp.js";
import { ListRevisionAssets } from "./ListRevisionAssets.js";
export const ListRevisionAssetsHttp = Layer.effect(ListRevisionAssets, makeRevisionHttpBinding({
    tag: "AWS.DataExchange.ListRevisionAssets",
    operation: dataexchange.listRevisionAssets,
    actions: ["dataexchange:ListRevisionAssets"],
}));
//# sourceMappingURL=ListRevisionAssetsHttp.js.map