import type * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * Hosting platform for the Amplify app. `WEB` = static site, `WEB_DYNAMIC` =
 * server-side rendered, `WEB_COMPUTE` = SSR with compute (Next.js 12+).
 */
export type Platform = "WEB" | "WEB_DYNAMIC" | "WEB_COMPUTE";
/**
 * A URL redirect/rewrite rule for the Amplify app.
 */
export interface CustomRule {
    /** Source URL pattern. */
    source: string;
    /** Target URL. */
    target: string;
    /** HTTP status / rule type (e.g. `"200"`, `"301"`, `"404"`). */
    status?: string;
    /** Condition (e.g. country code) for the rule to apply. */
    condition?: string;
}
export interface AppProps {
    /**
     * Name of the app. If omitted, a unique name is generated.
     */
    name?: string;
    /**
     * Description of the app.
     */
    description?: string;
    /**
     * Hosting platform.
     * @default "WEB"
     */
    platform?: Platform;
    /**
     * Environment variables available to the build.
     */
    environmentVariables?: Record<string, string>;
    /**
     * Build specification (amplify.yml contents) for the app.
     */
    buildSpec?: string;
    /**
     * URL redirect and rewrite rules.
     */
    customRules?: CustomRule[];
    /**
     * Whether to require basic auth to view the app's branches by default.
     */
    enableBasicAuth?: boolean;
    /**
     * Default basic auth credentials for the app's branches, as base64 of
     * `user:password`.
     */
    basicAuthCredentials?: Redacted.Redacted<string>;
    /**
     * User-defined tags to apply to the app.
     */
    tags?: Record<string, string>;
}
export interface App extends Resource<"AWS.Amplify.App", AppProps, {
    appId: string;
    appArn: string;
    name: string;
    platform: Platform;
    defaultDomain: string;
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An AWS Amplify Hosting app. This resource provisions the app container; it
 * does **not** connect a Git repository.
 *
 * Connecting a repository requires an OAuth handshake (via CodeConnections or a
 * personal access token) that is inherently human-in-the-loop and cannot be
 * automated from infrastructure code. To wire a repo, create the app with this
 * resource, then connect the repository from the Amplify console or CLI.
 * Manual-deploy branches (no repo required) are code-driven via the
 * {@link Branch} resource plus the `CreateDeployment`/`StartDeployment`
 * bindings. For a fully code-driven static/SSR site on AWS, prefer Alchemy's
 * own `Website` composites (S3 + CloudFront).
 *
 * ### Creating Amplify Apps
 * **Example:** Basic App
 * ```typescript
 * const app = yield* App("MyApp", {
 *   description: "Marketing site",
 *   platform: "WEB",
 * });
 * ```
 *
 * **Example:** App with Build Config and Redirects
 * ```typescript
 * const app = yield* App("MyApp", {
 *   platform: "WEB_COMPUTE",
 *   environmentVariables: { NODE_ENV: "production" },
 *   customRules: [
 *     { source: "/<*>", target: "/index.html", status: "404-200" },
 *   ],
 *   buildSpec: "version: 1\nfrontend:\n  phases:\n    build:\n      commands: []\n",
 * });
 * ```
 *
 * ### Deploying and Observing From a Function
 * **Example:** Manual Deploy Pipeline (CreateDeployment + StartDeployment)
 * ```typescript
 * // init — bind the deployment operations to the app
 * const createDeployment = yield* AWS.Amplify.CreateDeployment(app);
 * const startDeployment = yield* AWS.Amplify.StartDeployment(app);
 *
 * // runtime — stage, upload, release
 * const { jobId, zipUploadUrl } = yield* createDeployment({
 *   branchName: "main",
 * });
 * // PUT the site zip to zipUploadUrl, then:
 * yield* startDeployment({ branchName: "main", jobId });
 * ```
 *
 * **Example:** React to Deployment Status Changes
 * ```typescript
 * yield* AWS.Amplify.consumeDeploymentStatusChanges(
 *   { jobStatus: ["FAILED"] },
 *   (events) =>
 *     Stream.runForEach(events, (event) =>
 *       Effect.log(`build failed on ${event.detail.branchName}`),
 *     ),
 * );
 * ```
 *
 * @resource
 */
export declare const App: import("../../Resource.ts").ResourceClass<App>;
export declare const AppProvider: () => import("effect/Layer").Layer<Provider.Provider<App>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=App.d.ts.map