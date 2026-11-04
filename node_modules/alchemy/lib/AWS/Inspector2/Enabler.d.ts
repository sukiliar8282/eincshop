import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
/**
 * The Amazon Inspector scan types that can be enabled per account.
 */
export type ResourceScanType = "EC2" | "ECR" | "LAMBDA" | "LAMBDA_CODE" | "CODE_REPOSITORY";
declare const Inspector2NotConverged_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Inspector2NotConverged";
} & Readonly<A>;
/**
 * Raised when Inspector does not reach the requested scan state within the
 * provider's bounded convergence budget.
 */
export declare class Inspector2NotConverged extends Inspector2NotConverged_base<{
    readonly accountId: string;
    readonly expected: string;
    readonly actual: Readonly<Record<string, string | undefined>>;
}> {
}
export interface EnablerProps {
    /**
     * The resource scan types to enable for the account (e.g. `EC2`, `ECR`,
     * `LAMBDA`). Types managed by this resource are disabled again on destroy.
     */
    resourceTypes: ResourceScanType[];
}
/** @resource */
export interface Enabler extends Resource<"AWS.Inspector2.Enabler", EnablerProps, {
    /** The account the enabler applies to. */
    accountId: string;
    /** The scan types currently enabled and managed by this resource. */
    resourceTypes: string[];
    /** The overall Inspector account status (`ENABLED` / `DISABLED` / ...). */
    state: string | undefined;
}, never, Providers> {
}
/**
 * Amazon Inspector account enablement — an account/region singleton that turns
 * on continuous vulnerability scanning for the selected resource types (EC2,
 * ECR, Lambda). Inspector exposes no tagging, so ownership is tracked by the
 * set of scan types this resource enabled; destroy only disables those types
 * and leaves any the account had enabled out-of-band untouched.
 *
 * ### Enabling Inspector
 * **Example:** Enable EC2, ECR, and Lambda scanning
 * ```typescript
 * const inspector = yield* Inspector2.Enabler("Inspector", {
 *   resourceTypes: ["EC2", "ECR", "LAMBDA"],
 * });
 * ```
 */
declare const EnablerResource: import("../../Resource.ts").ResourceClass<Enabler>;
export { EnablerResource as Enabler };
export declare const EnablerProvider: () => import("effect/Layer").Layer<Provider.Provider<Enabler>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=Enabler.d.ts.map