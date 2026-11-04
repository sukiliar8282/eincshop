import type { CredentialsError, ResolvedCredentials } from "@distilled.cloud/aws/Credentials";
import * as Config from "effect/Config";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
export declare const AWS_PROFILE: Config.Config<string>;
export declare const AWS_REGION: Config.Config<string>;
export declare const AWS_ACCOUNT_ID: Config.Config<string>;
export declare const AWS_ACCESS_KEY_ID: Config.Config<string>;
export declare const AWS_SECRET_ACCESS_KEY: Config.Config<import("effect/Redacted").Redacted<string>>;
export declare const AWS_SESSION_TOKEN: Config.Config<import("effect/Redacted").Redacted<string>>;
export type AccountID = string;
export type RegionID = string;
declare const FailedToGetAccount_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "AWS::Environment::FailedToGetAccount";
} & Readonly<A>;
export declare class FailedToGetAccount extends FailedToGetAccount_base<{
    message: string;
    cause: Error;
}> {
}
/**
 * Fully-resolved AWS environment for a stack. Mirrors `CloudflareEnvironment`:
 * one Context.Service that holds account, region, credentials, endpoint, and
 * (optionally) the SSO profile name.
 *
 * `credentials` is held as an Effect so callers can refresh on each access
 * (SSO sessions expire). The Effect itself is constructed once when this
 * service is built; resolving it lazily preserves @distilled.cloud/aws's
 * existing `Credentials` semantics.
 */
export interface AWSEnvironmentShape {
    accountId: AccountID;
    region: RegionID;
    credentials: Effect.Effect<ResolvedCredentials, CredentialsError>;
    endpoint?: string;
    profile?: string;
}
declare const AWSEnvironment_base: Context.ServiceClass<AWSEnvironment, "AWS::Environment", Effect.Effect<AWSEnvironmentShape, never, never>>;
export declare class AWSEnvironment extends AWSEnvironment_base {
    static current: Effect.Effect<AWSEnvironmentShape, never, AWSEnvironment>;
    /**
     * Whether this environment is the floci emulator
     * (dummy account {@link LOCAL_ACCOUNT_ID}). A set `endpoint` is not
     * enough: `AWS_ENDPOINT_URL` and explicit endpoint overrides also
     * populate it on real-account credentials.
     */
    static isLocalEmulator: Effect.Effect<boolean, never, AWSEnvironment>;
    readonly kind: "Environment";
}
/** @see {@link AWSEnvironment.isLocalEmulator} */
export declare const isLocalEmulator: Effect.Effect<boolean, never, AWSEnvironment>;
export declare const Default: Layer.Layer<AWSEnvironment, never, import("../index.ts").AuthProviders | import("../Auth/Profile.ts").ProfileStore>;
export {};
//# sourceMappingURL=Environment.d.ts.map