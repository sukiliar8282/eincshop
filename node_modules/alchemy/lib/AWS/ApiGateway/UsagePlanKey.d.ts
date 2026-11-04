import type { Input } from "../../Input.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface UsagePlanKeyProps {
    /** ID of the usage plan to add the key to. */
    usagePlanId: Input<string>;
    /** ID of the API key to associate. */
    keyId: Input<string>;
    /**
     * @default "API_KEY"
     */
    keyType?: string;
}
/** @resource */
export interface UsagePlanKey extends Resource<"AWS.ApiGateway.UsagePlanKey", UsagePlanKeyProps, {
    usagePlanId: string;
    keyId: string;
    keyType: string;
    name: string | undefined;
}, never, Providers> {
}
/**
 * Associates an API key with a usage plan.
 *
 * ### Usage plan keys
 * **Example:** Associate key with plan
 * ```typescript
 * yield* ApiGateway.UsagePlanKey("PlanKey", {
 *   usagePlanId: plan.id,
 *   keyId: key.id,
 * });
 * ```
 */
declare const UsagePlanKeyResource: import("../../Resource.ts").ResourceClass<UsagePlanKey>;
export { UsagePlanKeyResource as UsagePlanKey };
export declare const UsagePlanKeyProvider: () => import("effect/Layer").Layer<Provider.Provider<UsagePlanKey>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=UsagePlanKey.d.ts.map