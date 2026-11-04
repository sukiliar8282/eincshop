import * as macie2 from "@distilled.cloud/aws/macie2";
import * as Layer from "effect/Layer";
import { makeMacie2HttpBinding } from "./BindingHttp.js";
import { ListManagedDataIdentifiers } from "./ListManagedDataIdentifiers.js";
export const ListManagedDataIdentifiersHttp = Layer.effect(ListManagedDataIdentifiers, makeMacie2HttpBinding({
    tag: "AWS.Macie2.ListManagedDataIdentifiers",
    operation: macie2.listManagedDataIdentifiers,
    actions: ["macie2:ListManagedDataIdentifiers"],
}));
//# sourceMappingURL=ListManagedDataIdentifiersHttp.js.map