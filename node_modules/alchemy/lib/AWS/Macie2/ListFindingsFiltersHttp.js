import * as macie2 from "@distilled.cloud/aws/macie2";
import * as Layer from "effect/Layer";
import { makeMacie2HttpBinding } from "./BindingHttp.js";
import { ListFindingsFilters } from "./ListFindingsFilters.js";
export const ListFindingsFiltersHttp = Layer.effect(ListFindingsFilters, makeMacie2HttpBinding({
    tag: "AWS.Macie2.ListFindingsFilters",
    operation: macie2.listFindingsFilters,
    actions: ["macie2:ListFindingsFilters"],
}));
//# sourceMappingURL=ListFindingsFiltersHttp.js.map