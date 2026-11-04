import * as organizations from "@distilled.cloud/aws/organizations";
import * as Layer from "effect/Layer";
import { makeOrganizationsHttpBinding } from "./BindingHttp.js";
import { ListAWSServiceAccessForOrganization } from "./ListAWSServiceAccessForOrganization.js";
export const ListAWSServiceAccessForOrganizationHttp = Layer.effect(ListAWSServiceAccessForOrganization, makeOrganizationsHttpBinding({
    capability: "ListAWSServiceAccessForOrganization",
    iamActions: ["organizations:ListAWSServiceAccessForOrganization"],
    operation: organizations.listAWSServiceAccessForOrganization,
}));
//# sourceMappingURL=ListAWSServiceAccessForOrganizationHttp.js.map