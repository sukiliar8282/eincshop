import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface RuleGroupsNamespaceProps {
    /**
     * Id of the AMP workspace this rule groups namespace belongs to. Changing
     * the workspace replaces the namespace.
     */
    workspaceId: string;
    /**
     * Name of the rule groups namespace. Changing the name replaces the
     * namespace.
     */
    name: string;
    /**
     * The rules definition as a Prometheus-format YAML document (the same
     * shape as a `prometheus.yml` `groups:` file). Updated in place.
     */
    definition: string;
    /**
     * User-defined tags for the namespace.
     */
    tags?: Record<string, string>;
}
export interface RuleGroupsNamespace extends Resource<"AWS.AMP.RuleGroupsNamespace", RuleGroupsNamespaceProps, {
    workspaceId: string;
    name: string;
    ruleGroupsNamespaceArn: string;
    status: string;
}, never, Providers> {
}
/**
 * A rule groups namespace inside an Amazon Managed Service for Prometheus
 * workspace — a container of Prometheus recording and alerting rules,
 * supplied as a YAML definition.
 *
 * ### Creating a Rule Groups Namespace
 * **Example:** Basic Recording Rule
 * ```typescript
 * const workspace = yield* AMP.Workspace("Metrics", {});
 * const rules = yield* AMP.RuleGroupsNamespace("Rules", {
 *   workspaceId: workspace.workspaceId,
 *   name: "default",
 *   definition: `groups:
 *   - name: example
 *     rules:
 *       - record: metric:requests:rate5m
 *         expr: rate(http_requests_total[5m])`,
 * });
 * ```
 *
 * @resource
 */
export declare const RuleGroupsNamespace: import("../../Resource.ts").ResourceClass<RuleGroupsNamespace>;
export declare const RuleGroupsNamespaceProvider: () => import("effect/Layer").Layer<Provider.Provider<RuleGroupsNamespace>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=RuleGroupsNamespace.d.ts.map