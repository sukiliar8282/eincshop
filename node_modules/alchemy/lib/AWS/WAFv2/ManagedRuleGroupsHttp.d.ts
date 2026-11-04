import * as Layer from "effect/Layer";
import { DescribeAllManagedProducts, DescribeManagedProductsByVendor, DescribeManagedRuleGroup, ListAvailableManagedRuleGroups, ListAvailableManagedRuleGroupVersions } from "./ManagedRuleGroups.ts";
export declare const DescribeManagedRuleGroupHttp: Layer.Layer<DescribeManagedRuleGroup, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
export declare const ListAvailableManagedRuleGroupsHttp: Layer.Layer<ListAvailableManagedRuleGroups, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
export declare const ListAvailableManagedRuleGroupVersionsHttp: Layer.Layer<ListAvailableManagedRuleGroupVersions, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
export declare const DescribeAllManagedProductsHttp: Layer.Layer<DescribeAllManagedProducts, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
export declare const DescribeManagedProductsByVendorHttp: Layer.Layer<DescribeManagedProductsByVendor, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ManagedRuleGroupsHttp.d.ts.map