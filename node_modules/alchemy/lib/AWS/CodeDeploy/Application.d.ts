import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
export interface ApplicationProps {
    /**
     * Name of the application (1-100 chars). If omitted a deterministic physical
     * name is generated. Changing the name replaces the application.
     */
    applicationName?: string;
    /**
     * The compute platform the application deploys to. Immutable — changing it
     * replaces the application.
     * @default "Server"
     */
    computePlatform?: "Server" | "Lambda" | "ECS";
    /**
     * User-defined tags.
     */
    tags?: Record<string, string>;
}
export interface Application extends Resource<"AWS.CodeDeploy.Application", ApplicationProps, {
    /** Physical name of the application. */
    applicationName: string;
    /** Unique CodeDeploy-assigned application ID. */
    applicationId: string;
    /** ARN of the application. */
    applicationArn: string;
    /** The compute platform (`Lambda`, `Server`, or `ECS`). */
    computePlatform: string;
}, never, Providers> {
}
/**
 * An AWS CodeDeploy application — a logical container that groups the
 * deployment groups and revisions for a single deployable unit on a given
 * compute platform (EC2/on-prem `Server`, `Lambda`, or `ECS`).
 *
 * ### Creating an Application
 * **Example:** Lambda Application
 * ```typescript
 * const app = yield* CodeDeploy.Application("api", {
 *   computePlatform: "Lambda",
 * });
 * ```
 *
 * **Example:** EC2/On-Premises Application
 * ```typescript
 * const app = yield* CodeDeploy.Application("web", {
 *   applicationName: "web-fleet",
 *   computePlatform: "Server",
 *   tags: { team: "platform" },
 * });
 * ```
 *
 * @resource
 */
export declare const Application: import("../../Resource.ts").ResourceClass<Application>;
export declare const ApplicationProvider: () => import("effect/Layer").Layer<Provider.Provider<Application>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Application.d.ts.map