import * as macie2 from "@distilled.cloud/aws/macie2";
import * as Layer from "effect/Layer";
import { makeMacie2HttpBinding } from "./BindingHttp.js";
import { ListFindings } from "./ListFindings.js";
export const ListFindingsHttp = Layer.effect(ListFindings, makeMacie2HttpBinding({
    tag: "AWS.Macie2.ListFindings",
    operation: macie2.listFindings,
    actions: ["macie2:ListFindings"],
}));
//# sourceMappingURL=ListFindingsHttp.js.map