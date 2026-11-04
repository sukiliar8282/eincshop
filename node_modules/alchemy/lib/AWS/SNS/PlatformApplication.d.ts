import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
export type PlatformApplicationArn = string;
export interface PlatformApplicationProps {
    /**
     * Name of the platform application. Up to 256 characters of letters,
     * numbers, underscores, hyphens, and periods.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * Push notification platform, e.g. `GCM` (Firebase Cloud Messaging),
     * `APNS`, `APNS_SANDBOX`, `ADM`, or `BAIDU`. Changing the platform
     * replaces the application.
     */
    platform: string;
    /**
     * Platform credential — the FCM API key / service account JSON (GCM), the
     * APNS private key, or the ADM client secret. SNS validates the credential
     * at creation time. Write-only: SNS never returns it, so it is pushed on
     * create/adopt and whenever the configured value changes.
     */
    platformCredential: Redacted.Redacted<string>;
    /**
     * Platform principal — the APNS SSL certificate or ADM client id. Not
     * applicable for GCM. Write-only like `platformCredential`.
     */
    platformPrincipal?: Redacted.Redacted<string>;
    /**
     * Additional mutable SNS platform application attributes keyed by AWS
     * attribute name, such as `EventEndpointCreated`, `EventDeliveryFailure`,
     * `SuccessFeedbackRoleArn`, or `SuccessFeedbackSampleRate`.
     */
    attributes?: Record<string, string>;
}
export interface PlatformApplication extends Resource<"AWS.SNS.PlatformApplication", PlatformApplicationProps, {
    /** ARN of the platform application. */
    platformApplicationArn: PlatformApplicationArn;
    /** Name of the platform application. */
    name: string;
    /** Push notification platform (e.g. `GCM`, `APNS`). */
    platform: string;
    /** Whether the platform application is enabled (credentials valid). */
    enabled: boolean;
    /** Observed non-sensitive SNS attributes keyed by AWS attribute name. */
    attributes: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon SNS platform application for mobile push notifications (FCM,
 * APNS, ADM, Baidu).
 *
 * A platform application holds the push service credentials; device tokens
 * are registered against it at runtime with the
 * `CreatePlatformEndpoint` binding, and messages are delivered with
 * `PublishToEndpoint`. SNS validates the credential when the application is
 * created, so a real push-service credential is required.
 * ### Creating Platform Applications
 * **Example:** FCM (GCM) Application
 * ```typescript
 * import * as SNS from "alchemy/AWS/SNS";
 * import * as Redacted from "effect/Redacted";
 *
 * const app = yield* SNS.PlatformApplication("PushApp", {
 *   platform: "GCM",
 *   platformCredential: Redacted.make(process.env.FCM_API_KEY!),
 * });
 * ```
 *
 * **Example:** APNS Application
 * ```typescript
 * const app = yield* SNS.PlatformApplication("IosPushApp", {
 *   platform: "APNS",
 *   platformCredential: Redacted.make(apnsPrivateKey),
 *   platformPrincipal: Redacted.make(apnsCertificate),
 * });
 * ```
 *
 * ### Runtime Endpoints
 * **Example:** Register a Device Token at Runtime
 * ```typescript
 * // init
 * const createEndpoint = yield* SNS.CreatePlatformEndpoint(app);
 * const publishToEndpoint = yield* SNS.PublishToEndpoint(app);
 *
 * // runtime
 * const endpoint = yield* createEndpoint({ Token: deviceToken });
 * yield* publishToEndpoint({
 *   TargetArn: endpoint.EndpointArn!,
 *   Message: "hello",
 * });
 * ```
 *
 * @resource
 */
export declare const PlatformApplication: import("../../Resource.ts").ResourceClass<PlatformApplication>;
export declare const PlatformApplicationProvider: () => import("effect/Layer").Layer<Provider.Provider<PlatformApplication>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=PlatformApplication.d.ts.map