import * as Layer from "effect/Layer";
import { ListResolverRuleAssociations } from "./ListResolverRuleAssociations.ts";
/**
 * Bespoke (not via `BindingHttp.ts`): the operation is filter-based rather
 * than ID-keyed, so the rule is injected as a `ResolverRuleId` filter instead
 * of a request field. The IAM grant is `Resource: "*"` — verified live:
 * `route53resolver:ListResolverRuleAssociations` does not support
 * resource-level permissions (a rule-ARN-scoped grant is AccessDenied), the
 * runtime callable's injected filter is what scopes results to the bound
 * rule. The operation also internally describes the associated VPCs, so
 * `ec2:DescribeVpcs` is required alongside it (also verified live — without
 * it the call fails with `InvalidParameterException: You are not authorized
 * to perform this operation ... ec2:DescribeVpcs`).
 */
export declare const ListResolverRuleAssociationsHttp: Layer.Layer<ListResolverRuleAssociations, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ListResolverRuleAssociationsHttp.d.ts.map