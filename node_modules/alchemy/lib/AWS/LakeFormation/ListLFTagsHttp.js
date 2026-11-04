import * as lf from "@distilled.cloud/aws/lakeformation";
import * as Layer from "effect/Layer";
import { makeLakeFormationHttpBinding } from "./BindingHttp.js";
import { ListLFTags } from "./ListLFTags.js";
export const ListLFTagsHttp = Layer.effect(ListLFTags, makeLakeFormationHttpBinding({
    capability: "ListLFTags",
    iamActions: ["lakeformation:ListLFTags"],
    operation: lf.listLFTags,
}));
//# sourceMappingURL=ListLFTagsHttp.js.map