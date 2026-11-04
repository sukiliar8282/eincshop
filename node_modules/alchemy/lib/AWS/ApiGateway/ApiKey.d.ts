import * as ag from "@distilled.cloud/aws/api-gateway";
import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import { AWSEnvironment } from "../Environment.ts";
export interface ApiKeyProps {
    /**
     * Friendly name for the API key.
     *
     * If omitted, Alchemy generates a deterministic physical name from the
     * stack, stage, logical ID, and instance ID.
     */
    name?: string;
    /**
     * Human-readable description shown in API Gateway.
     */
    description?: string;
    /**
     * Whether clients can use the key.
     *
     * @default true
     */
    enabled?: boolean;
    /**
     * Appends a distinct suffix to the generated key value when AWS generates it.
     */
    generateDistinctId?: boolean;
    /**
     * Write-only value when creating; never stored in resource state or outputs.
     * Wrap with `Redacted.make` so state encoding preserves redaction.
     */
    value?: Redacted.Redacted<string>;
    /**
     * Stage associations to attach directly to this API key.
     */
    stageKeys?: ag.StageKey[];
    /**
     * External customer identifier associated with the key.
     */
    customerId?: string;
    /**
     * User-defined tags. Alchemy internal tags are merged automatically.
     */
    tags?: Record<string, string>;
}
/** @resource */
export interface ApiKey extends Resource<"AWS.ApiGateway.ApiKey", ApiKeyProps, {
    id: string;
    name: string | undefined;
    enabled: boolean | undefined;
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * API Gateway API key for usage plans and `apiKeyRequired` methods.
 *
 * ### API keys
 * **Example:** Generated key
 * ```typescript
 * const key = yield* ApiGateway.ApiKey("PartnerKey", {
 *   generateDistinctId: true,
 * });
 * ```
 */
declare const ApiKeyResource: import("../../Resource.ts").ResourceClass<ApiKey>;
export { ApiKeyResource as ApiKey };
export declare const ApiKeyProvider: () => import("effect/Layer").Layer<Provider.Provider<ApiKey>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ApiKey.d.ts.map