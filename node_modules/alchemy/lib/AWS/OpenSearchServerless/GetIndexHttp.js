import * as aoss from "@distilled.cloud/aws/opensearchserverless";
import * as Layer from "effect/Layer";
import { makeAossCollectionHttpBinding } from "./BindingHttp.js";
import { GetIndex } from "./GetIndex.js";
export const GetIndexHttp = Layer.effect(GetIndex, makeAossCollectionHttpBinding({
    tag: "AWS.OpenSearchServerless.GetIndex",
    operation: aoss.getIndex,
    actions: ["aoss:APIAccessAll"],
}));
//# sourceMappingURL=GetIndexHttp.js.map