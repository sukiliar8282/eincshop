import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
/**
 * Single sign-on configuration for a DataZone domain via IAM Identity Center.
 */
export interface DomainSingleSignOn {
    /** The SSO type — `IAM_IDC` to enable IAM Identity Center, `DISABLED` otherwise. */
    type?: string;
    /** How users are assigned — `AUTOMATIC` or `MANUAL`. */
    userAssignment?: string;
    /** The ARN of the IAM Identity Center instance. */
    idcInstanceArn?: string;
}
export interface DomainProps {
    /**
     * Display name of the domain. If omitted, a deterministic physical name is
     * generated from the app, stage, and logical ID. The name is mutable — it
     * converges via `UpdateDomain` without replacement.
     */
    name?: string;
    /**
     * A description of the domain.
     */
    description?: string;
    /**
     * The ARN of an existing IAM role for DataZone to act on behalf of domain
     * users (metadata catalog, search, etc.). When omitted, an execution role
     * is created automatically with `datazone.amazonaws.com` trust and the
     * `AmazonDataZoneDomainExecutionRolePolicy` managed policy attached.
     */
    domainExecutionRole?: string;
    /**
     * The ARN of the service role used by V2 (SageMaker Unified Studio)
     * domains. Only relevant when `domainVersion` is `"V2"`.
     */
    serviceRole?: string;
    /**
     * The identifier of a KMS key to encrypt the domain with. Changing it
     * triggers a replacement.
     */
    kmsKeyIdentifier?: string;
    /**
     * The version of the domain — `"V1"` (classic DataZone) or `"V2"`
     * (SageMaker Unified Studio). Changing it triggers a replacement.
     * @default "V1"
     */
    domainVersion?: string;
    /**
     * Single sign-on configuration via IAM Identity Center.
     */
    singleSignOn?: DomainSingleSignOn;
    /**
     * Tags to apply to the domain. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Domain extends Resource<"AWS.DataZone.Domain", DomainProps, {
    /** The unique identifier of the domain (`dzd_...`). */
    domainId: string;
    /** The ARN of the domain. */
    domainArn: string;
    /** The display name of the domain. */
    name: string;
    /** The status of the domain (`AVAILABLE` once settled). */
    status: string;
    /** The URL of the DataZone data portal for this domain. */
    portalUrl: string | undefined;
    /** The identifier of the root domain unit. */
    rootDomainUnitId: string | undefined;
    /** The ARN of the domain execution role. */
    domainExecutionRole: string;
    /**
     * Name of the auto-created execution role. `undefined` when an explicit
     * {@link DomainProps.domainExecutionRole} is used.
     */
    roleName: string | undefined;
}> {
}
/**
 * An Amazon DataZone domain — the top-level container for data-governance
 * projects, environments, glossaries, and assets.
 *
 * `Domain` owns the domain lifecycle. Domain creation is asynchronous
 * (typically 1–2 minutes) and is polled to `AVAILABLE` with a bounded wait.
 * An execution role is created automatically (trusted by
 * `datazone.amazonaws.com`, with the `AmazonDataZoneDomainExecutionRolePolicy`
 * managed policy) unless an explicit `domainExecutionRole` is supplied.
 *
 * ### Creating Domains
 * **Example:** Minimal Domain
 * ```typescript
 * import * as DataZone from "alchemy/AWS/DataZone";
 *
 * const domain = yield* DataZone.Domain("governance", {
 *   description: "Company-wide data governance domain",
 * });
 * ```
 *
 * **Example:** Domain with an Explicit Execution Role
 * ```typescript
 * const domain = yield* DataZone.Domain("governance", {
 *   name: "acme-governance",
 *   domainExecutionRole: role.roleArn,
 *   tags: { Team: "data-platform" },
 * });
 * ```
 *
 * ### Using the Domain
 * **Example:** Create a Project in the Domain
 * ```typescript
 * const project = yield* DataZone.Project("analytics", {
 *   domainId: domain.domainId,
 *   description: "Analytics team project",
 * });
 * ```
 *
 * @resource
 */
export declare const Domain: import("../../Resource.ts").ResourceClass<Domain>;
declare const DomainCreationFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "AWS.DataZone.DomainCreationFailed";
} & Readonly<A>;
/** The domain never leaves a failed create — surface it as a typed error. */
export declare class DomainCreationFailed extends DomainCreationFailed_base<{
    readonly domainId: string;
    readonly status: string;
}> {
}
export declare const DomainProvider: () => import("effect/Layer").Layer<Provider.Provider<Domain>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=Domain.d.ts.map