import type * as Duration from "effect/Duration";
import type * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * Deployment stage of an Amplify branch.
 */
export type BranchStage = "PRODUCTION" | "BETA" | "DEVELOPMENT" | "EXPERIMENTAL" | "PULL_REQUEST";
export interface BranchProps {
    /**
     * ID of the Amplify {@link App} the branch belongs to. Changing it replaces
     * the branch.
     */
    appId: string;
    /**
     * Name of the branch (e.g. `main`). For an app without a connected
     * repository this is just a label for manual deployments. If omitted, a
     * unique name is generated. Changing it replaces the branch.
     */
    branchName?: string;
    /**
     * Description of the branch.
     */
    description?: string;
    /**
     * Display name shown in the Amplify console.
     */
    displayName?: string;
    /**
     * Deployment stage of the branch.
     */
    stage?: BranchStage;
    /**
     * Framework label for the branch (e.g. `React`, `Next.js`).
     */
    framework?: string;
    /**
     * Whether pushing to the (repo-connected) branch automatically triggers a
     * build. Branches of repo-less apps should set this to `false`.
     */
    enableAutoBuild?: boolean;
    /**
     * Whether to enable deployment skew protection for the branch.
     */
    enableSkewProtection?: boolean;
    /**
     * Whether to enable performance mode (longer edge cache intervals).
     */
    enablePerformanceMode?: boolean;
    /**
     * Environment variables available to builds of this branch.
     */
    environmentVariables?: Record<string, string>;
    /**
     * Whether to require basic auth to view the branch's site.
     */
    enableBasicAuth?: boolean;
    /**
     * Basic auth credentials for the branch, as base64 of `user:password`.
     */
    basicAuthCredentials?: Redacted.Redacted<string>;
    /**
     * Build specification (amplify.yml contents) overriding the app's.
     */
    buildSpec?: string;
    /**
     * Content Time-To-Live for the branch's website (wire unit: seconds).
     */
    ttl?: Duration.Input;
    /**
     * Whether pull requests to the (repo-connected) branch create previews.
     */
    enablePullRequestPreview?: boolean;
    /**
     * Amplify environment name used for pull request previews.
     */
    pullRequestEnvironmentName?: string;
    /**
     * User-defined tags to apply to the branch.
     */
    tags?: Record<string, string>;
}
export interface Branch extends Resource<"AWS.Amplify.Branch", BranchProps, {
    appId: string;
    branchName: string;
    branchArn: string;
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * A branch of an AWS Amplify Hosting app.
 *
 * For apps without a connected Git repository, a branch is the target of the
 * manual-deploy pipeline: stage a zip with `CreateDeployment`, upload it to
 * the pre-signed URL, and release it with `StartDeployment`.
 *
 * ### Creating Branches
 * **Example:** Manual-Deploy Branch
 * ```typescript
 * const app = yield* App("MySite", { platform: "WEB" });
 * const branch = yield* Branch("Main", {
 *   appId: app.appId,
 *   branchName: "main",
 *   stage: "PRODUCTION",
 *   enableAutoBuild: false,
 * });
 * ```
 *
 * **Example:** Password-Protected Branch with Content TTL
 * ```typescript
 * const branch = yield* Branch("Preview", {
 *   appId: app.appId,
 *   branchName: "preview",
 *   stage: "DEVELOPMENT",
 *   ttl: "10 minutes",
 *   enableBasicAuth: true,
 *   // base64 of "user:password"
 *   basicAuthCredentials: Redacted.make(credentials),
 * });
 * ```
 *
 * @resource
 */
export declare const Branch: import("../../Resource.ts").ResourceClass<Branch>;
export declare const BranchProvider: () => import("effect/Layer").Layer<Provider.Provider<Branch>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Branch.d.ts.map