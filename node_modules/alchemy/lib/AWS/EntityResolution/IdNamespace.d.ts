import * as entityresolution from "@distilled.cloud/aws/entityresolution";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface IdNamespaceProps {
    /**
     * Name of the ID namespace. Must be unique per account/region and match
     * `[a-zA-Z_0-9-]*`. If omitted, a unique name is generated from the app,
     * stage, and logical ID. Changing the name replaces the ID namespace.
     */
    idNamespaceName?: string;
    /**
     * A description of the ID namespace.
     */
    description?: string;
    /**
     * The kind of data this namespace holds: `SOURCE` namespaces contain the
     * records to be mapped, `TARGET` namespaces contain the dataset (and, for
     * rule-based mapping, the matching rules) the sources are mapped onto.
     * Changing the type replaces the ID namespace.
     */
    type: entityresolution.IdNamespaceType;
    /**
     * The input records of the namespace: each entry names a Glue table
     * (`inputSourceARN`) and optionally the schema mapping (`schemaName`) that
     * describes its columns.
     */
    inputSourceConfig?: entityresolution.IdNamespaceInputSource[];
    /**
     * How this namespace participates in ID mapping workflows: `RULE_BASED`
     * with `ruleBasedProperties` (rules live on the `TARGET` namespace) or a
     * `PROVIDER` service.
     */
    idMappingWorkflowProperties?: entityresolution.IdNamespaceIdMappingWorkflowProperties[];
    /**
     * The ARN of the IAM role Entity Resolution assumes to read the namespace's
     * input Glue tables on your behalf. Required when `inputSourceConfig`
     * references Glue tables.
     */
    roleArn?: string;
    /**
     * Tags to apply to the ID namespace. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface IdNamespace extends Resource<"AWS.EntityResolution.IdNamespace", IdNamespaceProps, {
    /**
     * The name of the ID namespace.
     */
    idNamespaceName: string;
    /**
     * The ARN of the ID namespace.
     */
    idNamespaceArn: string;
}, never, Providers> {
}
/**
 * An AWS Entity Resolution ID namespace — a wrapper around an input dataset
 * used by ID mapping workflows. A `SOURCE` namespace holds the records to be
 * translated; a `TARGET` namespace holds the dataset (and the rule-based
 * matching configuration) they are mapped onto.
 *
 * ### Creating ID Namespaces
 * **Example:** Source namespace over a Glue table
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const source = yield* AWS.EntityResolution.IdNamespace("Source", {
 *   type: "SOURCE",
 *   inputSourceConfig: [
 *     { inputSourceARN: table.tableArn, schemaName: schema.schemaName },
 *   ],
 *   idMappingWorkflowProperties: [{ idMappingType: "RULE_BASED" }],
 *   roleArn: role.roleArn,
 * });
 * ```
 *
 * **Example:** Target namespace with matching rules
 * ```typescript
 * const target = yield* AWS.EntityResolution.IdNamespace("Target", {
 *   type: "TARGET",
 *   inputSourceConfig: [
 *     { inputSourceARN: table.tableArn, schemaName: schema.schemaName },
 *   ],
 *   idMappingWorkflowProperties: [
 *     {
 *       idMappingType: "RULE_BASED",
 *       ruleBasedProperties: {
 *         rules: [{ ruleName: "ByEmail", matchingKeys: ["email"] }],
 *         ruleDefinitionTypes: ["TARGET"],
 *         attributeMatchingModel: "ONE_TO_ONE",
 *         recordMatchingModels: ["ONE_SOURCE_TO_ONE_TARGET"],
 *       },
 *     },
 *   ],
 *   roleArn: role.roleArn,
 * });
 * ```
 *
 * @resource
 */
export declare const IdNamespace: import("../../Resource.ts").ResourceClass<IdNamespace>;
export declare const IdNamespaceProvider: () => import("effect/Layer").Layer<Provider.Provider<IdNamespace>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=IdNamespace.d.ts.map