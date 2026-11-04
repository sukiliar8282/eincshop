import * as accounts from "@distilled.cloud/cloudflare/accounts";
import * as user from "@distilled.cloud/cloudflare/user";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import { type PermissionGroup, type TokenPolicy } from "../../Cloudflare/Auth/TokenPolicy.ts";
import { AlchemistInvalidInput, type Diagnostic } from "../Errors.ts";
export interface GlobalCredentials {
    readonly email: string;
    readonly apiKey: Redacted.Redacted<string>;
}
export interface Account {
    readonly id: string;
    readonly name: string;
}
export type { PermissionGroup, TokenPolicy, } from "../../Cloudflare/Auth/TokenPolicy.ts";
export interface TokenCatalog {
    readonly accounts: ReadonlyArray<Account>;
    readonly permissionGroups: ReadonlyArray<PermissionGroup>;
}
export interface PlanInput {
    readonly credentials: GlobalCredentials;
    readonly name: string;
    readonly accountIds: ReadonlyArray<string>;
    readonly permissionGroupIds: ReadonlyArray<string> | "all";
}
export interface TokenPlan {
    readonly name: string;
    readonly accountIds: ReadonlyArray<string>;
    readonly permissionGroupIds: ReadonlyArray<string>;
    readonly permissionCount: number;
    readonly grantsFullAccess: boolean;
    readonly policies: ReadonlyArray<TokenPolicy>;
}
export interface CreateInput {
    readonly credentials: GlobalCredentials;
    readonly plan: TokenPlan;
}
export interface CreatedToken {
    readonly id: string;
    readonly name: string;
    readonly value: Redacted.Redacted<string>;
    readonly grantedPermissionGroups: number;
    /** Echoed back by Cloudflare; may contain effects we never request. */
    readonly policies: ReadonlyArray<unknown>;
    readonly verificationStatus?: string;
    readonly diagnostics: ReadonlyArray<Diagnostic>;
}
declare const CloudflareTokenError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "CloudflareTokenError";
} & Readonly<A>;
/** Cloudflare accepted the create call but returned no usable token. */
export declare class CloudflareTokenError extends CloudflareTokenError_base<{
    readonly message: string;
}> {
}
/** The accounts and permission groups a token can be scoped to. */
export declare const catalog: (credentials: GlobalCredentials) => Effect.Effect<{
    accounts: {
        id: string;
        name: string;
    }[];
    permissionGroups: {
        id: string;
        name: string;
        category: user.TokensPermissionGroupsListResultItemCategory | undefined;
        scopes: user.TokensPermissionGroupsListResultItemScopesList;
        selectable: boolean;
    }[];
}, accounts.CloudflareOpError, import("effect/unstable/http/HttpClient").HttpClient>;
/** Resolve the selected permission groups into concrete token policies. */
export declare const plan: (input: PlanInput) => Effect.Effect<{
    name: string;
    accountIds: readonly string[];
    permissionGroupIds: string[];
    permissionCount: number;
    grantsFullAccess: boolean;
    policies: TokenPolicy[];
}, AlchemistInvalidInput | accounts.CloudflareOpError, import("effect/unstable/http/HttpClient").HttpClient>;
/** Mint the planned token with the user's Global API Key. */
export declare const create: (input: CreateInput) => Effect.Effect<{
    id: string;
    name: string;
    value: Redacted.Redacted<string>;
    grantedPermissionGroups: number;
    policies: readonly TokenPolicy[] | user.TokensCreateResponsePoliciesList;
    verificationStatus: user.TokensVerifyResponseStatus | undefined;
    diagnostics: {
        severity: "warning";
        code: string;
        message: string;
    }[];
}, CloudflareTokenError | user.CreateTokenError, import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=cloudflareToken.d.ts.map