import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
export interface WorkspaceProps {
    /**
     * A name for the workspace. If omitted, a deterministic physical name is
     * generated.
     */
    name?: string;
    /**
     * A description for the workspace.
     */
    description?: string;
    /**
     * Whether the workspace can access AWS resources in only the current
     * account (`CURRENT_ACCOUNT`) or throughout an organization
     * (`ORGANIZATION`). Changing this replaces the workspace.
     * @default "CURRENT_ACCOUNT"
     */
    accountAccessType?: "CURRENT_ACCOUNT" | "ORGANIZATION";
    /**
     * The user authentication providers for the workspace. `AWS_SSO` requires
     * IAM Identity Center to be enabled in the account; `SAML` configures an
     * external IdP after creation. Changing this replaces the workspace.
     */
    authenticationProviders: Array<"AWS_SSO" | "SAML">;
    /**
     * Whether AWS manages the workspace's IAM role and permissions
     * (`SERVICE_MANAGED`) or you supply `workspaceRoleArn`
     * (`CUSTOMER_MANAGED`). Changing this replaces the workspace.
     * @default "SERVICE_MANAGED"
     */
    permissionType?: "SERVICE_MANAGED" | "CUSTOMER_MANAGED";
    /**
     * ARN of an IAM role the workspace uses to access AWS data sources and
     * notification channels. Required when `permissionType` is
     * `CUSTOMER_MANAGED`.
     */
    workspaceRoleArn?: string;
    /**
     * AWS services the workspace can query as data sources (e.g.
     * `PROMETHEUS`, `CLOUDWATCH`, `XRAY`).
     */
    dataSources?: string[];
    /**
     * The Grafana version for the workspace (e.g. `"10.4"`). If omitted, AWS
     * chooses the current default.
     */
    grafanaVersion?: string;
    /**
     * User-defined tags for the workspace.
     */
    tags?: Record<string, string>;
}
export interface Workspace extends Resource<"AWS.Grafana.Workspace", WorkspaceProps, {
    /** The unique ID of the workspace. */
    workspaceId: string;
    /** The ARN of the workspace. */
    workspaceArn: string;
    /** The URL of the workspace's Grafana console. */
    endpoint: string;
    /** The Grafana version the workspace runs. */
    grafanaVersion: string;
    /** The current status of the workspace (`ACTIVE`, `CREATING`, ...). */
    status: string;
}, never, Providers> {
}
/**
 * An Amazon Managed Grafana workspace — a fully-managed Grafana server for
 * visualizing operational metrics, logs, and traces.
 *
 * Grafana workspaces require IAM Identity Center (AWS SSO) to be enabled in
 * the account when `authenticationProviders` includes `AWS_SSO`. Workspace
 * provisioning is asynchronous and can take a few minutes.
 *
 * ### Creating a Workspace
 * **Example:** SSO-Authenticated Workspace
 * ```typescript
 * const workspace = yield* Grafana.Workspace("Dashboards", {
 *   accountAccessType: "CURRENT_ACCOUNT",
 *   authenticationProviders: ["AWS_SSO"],
 *   permissionType: "SERVICE_MANAGED",
 *   dataSources: ["PROMETHEUS", "CLOUDWATCH"],
 * });
 * ```
 *
 * @resource
 */
export declare const Workspace: import("../../Resource.ts").ResourceClass<Workspace>;
export declare const WorkspaceProvider: () => import("effect/Layer").Layer<Provider.Provider<Workspace>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Workspace.d.ts.map