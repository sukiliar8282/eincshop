import * as ram from "@distilled.cloud/aws/ram";
import * as Layer from "effect/Layer";
import { makeRAMHttpBinding } from "./BindingHttp.js";
import { ListResources } from "./ListResources.js";
export const ListResourcesHttp = Layer.effect(ListResources, makeRAMHttpBinding({
    capability: "ListResources",
    iamActions: ["ram:ListResources"],
    operation: ram.listResources,
}));
//# sourceMappingURL=ListResourcesHttp.js.map