import * as textract from "@distilled.cloud/aws/textract";
import * as Layer from "effect/Layer";
import { makeTextractAdapterHttpBinding } from "./BindingHttp.js";
import { GetAdapter } from "./GetAdapter.js";
export const GetAdapterHttp = Layer.effect(GetAdapter, makeTextractAdapterHttpBinding({
    capability: "GetAdapter",
    iamActions: ["textract:GetAdapter"],
    operation: textract.getAdapter,
}));
//# sourceMappingURL=GetAdapterHttp.js.map