import * as aoss from "@distilled.cloud/aws/opensearchserverless";
import * as Layer from "effect/Layer";
import { makeAossCollectionHttpBinding } from "./BindingHttp.js";
import { UpdateIndex } from "./UpdateIndex.js";
export const UpdateIndexHttp = Layer.effect(UpdateIndex, makeAossCollectionHttpBinding({
    tag: "AWS.OpenSearchServerless.UpdateIndex",
    operation: aoss.updateIndex,
    actions: ["aoss:APIAccessAll"],
}));
//# sourceMappingURL=UpdateIndexHttp.js.map