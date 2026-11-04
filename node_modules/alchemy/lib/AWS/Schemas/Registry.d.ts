import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { type PolicyDocument } from "../IAM/Policy.ts";
import type { Providers } from "../Providers.ts";
export interface RegistryProps {
    /**
     * Name of the registry. Must match `[a-zA-Z0-9-_.@]+` and be at most 64
     * characters. If omitted, a unique name is generated. Changing it replaces
     * the registry.
     */
    registryName?: string;
    /**
     * A description of the registry.
     */
    description?: string;
    /**
     * User tags to attach to the registry.
     */
    tags?: Record<string, string>;
    /**
     * Resource-based policy attached to the registry, granting other AWS
     * accounts or principals access to the registry and its schemas. Provided
     * as a structured {@link PolicyDocument} or a raw JSON string. Omitting it
     * removes any existing resource policy.
     */
    policy?: PolicyDocument | string;
}
export interface Registry extends Resource<"AWS.Schemas.Registry", RegistryProps, {
    /** The name of the registry. */
    registryName: string;
    /** The ARN of the registry. */
    registryArn: string;
}, never, Providers> {
}
/**
 * An EventBridge Schema Registry — a named collection of event schemas.
 * Custom registries hold your own OpenAPI 3 / JSONSchema Draft 4 schema
 * documents; AWS also maintains the built-in `aws.events` and
 * `discovered-schemas` registries.
 *
 * ### Creating a Registry
 * **Example:** Basic Registry
 * ```typescript
 * const registry = yield* AWS.Schemas.Registry("app-events", {
 *   description: "Schemas for application events",
 * });
 * ```
 *
 * **Example:** Registry with Tags
 * ```typescript
 * const registry = yield* AWS.Schemas.Registry("orders", {
 *   description: "Order lifecycle events",
 *   tags: { team: "payments" },
 * });
 * ```
 *
 * ### Sharing a Registry
 * **Example:** Registry with a Resource Policy
 * ```typescript
 * const registry = yield* AWS.Schemas.Registry("shared-events", {
 *   policy: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         Principal: { AWS: `arn:aws:iam::${otherAccountId}:root` },
 *         Action: ["schemas:DescribeRegistry", "schemas:SearchSchemas"],
 *         Resource: registryArn,
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * ### Adding Schemas
 * **Example:** Registry with a Schema
 * ```typescript
 * const registry = yield* AWS.Schemas.Registry("app-events", {});
 * const schema = yield* AWS.Schemas.Schema("OrderCreated", {
 *   registryName: registry.registryName,
 *   type: "OpenApi3",
 *   content: JSON.stringify(openApiDocument),
 * });
 * ```
 *
 * @resource
 */
export declare const Registry: import("../../Resource.ts").ResourceClass<Registry>;
export declare const RegistryProvider: () => import("effect/Layer").Layer<Provider.Provider<Registry>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Registry.d.ts.map