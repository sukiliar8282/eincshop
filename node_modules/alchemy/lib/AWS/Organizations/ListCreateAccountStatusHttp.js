import * as organizations from "@distilled.cloud/aws/organizations";
import * as Layer from "effect/Layer";
import { makeOrganizationsHttpBinding } from "./BindingHttp.js";
import { ListCreateAccountStatus } from "./ListCreateAccountStatus.js";
export const ListCreateAccountStatusHttp = Layer.effect(ListCreateAccountStatus, makeOrganizationsHttpBinding({
    capability: "ListCreateAccountStatus",
    iamActions: ["organizations:ListCreateAccountStatus"],
    operation: organizations.listCreateAccountStatus,
}));
//# sourceMappingURL=ListCreateAccountStatusHttp.js.map