import * as entityresolution from "@distilled.cloud/aws/entityresolution";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface SchemaMappingProps {
    /**
     * Name of the schema mapping. Must be unique per account/region and match
     * `[a-zA-Z_0-9-]*`. If omitted, a unique name is generated from the app,
     * stage, and logical ID. Changing the name replaces the schema mapping.
     */
    schemaName?: string;
    /**
     * A description of the schema mapping.
     */
    description?: string;
    /**
     * The columns of the input records table and how Entity Resolution should
     * interpret them: the attribute `type` (e.g. `UNIQUE_ID`, `EMAIL_ADDRESS`,
     * `NAME`, `PHONE_NUMBER`), an optional `matchKey` used by rule-based
     * matching, and optional `groupName`/`subType`/`hashed` metadata.
     *
     * Mutable in place — but a schema mapping becomes immutable while it is
     * referenced by a matching workflow.
     */
    mappedInputFields: entityresolution.SchemaInputAttribute[];
    /**
     * Tags to apply to the schema mapping. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface SchemaMapping extends Resource<"AWS.EntityResolution.SchemaMapping", SchemaMappingProps, {
    /**
     * The name of the schema mapping.
     */
    schemaName: string;
    /**
     * The ARN of the schema mapping.
     */
    schemaArn: string;
}, never, Providers> {
}
/**
 * An AWS Entity Resolution schema mapping — the schema of an input customer
 * records table. It tells Entity Resolution the attribute type of each column
 * (name, email, phone, unique id, …) and which columns rule-based matching
 * compares via `matchKey`.
 *
 * ### Creating Schema Mappings
 * **Example:** Customer records schema
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const schema = yield* AWS.EntityResolution.SchemaMapping("Customers", {
 *   mappedInputFields: [
 *     { fieldName: "id", type: "UNIQUE_ID" },
 *     { fieldName: "email", type: "EMAIL_ADDRESS", matchKey: "email" },
 *     { fieldName: "name", type: "NAME", matchKey: "name" },
 *   ],
 * });
 * ```
 *
 * ### Matching Workflows
 * **Example:** Use the schema in a matching workflow input source
 * ```typescript
 * const workflow = yield* AWS.EntityResolution.MatchingWorkflow("Dedupe", {
 *   inputSourceConfig: [
 *     { inputSourceARN: table.tableArn, schemaName: schema.schemaName },
 *   ],
 *   // ...
 * });
 * ```
 *
 * @resource
 */
export declare const SchemaMapping: import("../../Resource.ts").ResourceClass<SchemaMapping>;
export declare const SchemaMappingProvider: () => import("effect/Layer").Layer<Provider.Provider<SchemaMapping>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=SchemaMapping.d.ts.map