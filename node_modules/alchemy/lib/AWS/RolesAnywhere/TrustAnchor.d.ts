import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
declare const TrustAnchorSourceConflict_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "TrustAnchorSourceConflict";
} & Readonly<A>;
/**
 * Raised before any AWS call when the trust anchor's source is misconfigured
 * — exactly one of `certificateBundle` or `acmPcaArn` must be provided.
 */
export declare class TrustAnchorSourceConflict extends TrustAnchorSourceConflict_base<{
    readonly message: string;
}> {
}
/**
 * A customized expiry notification for the trust anchor. AWS installs
 * default notifications (45 days before CA and end-entity certificate
 * expiry); declaring a setting for the same event/channel overrides the
 * default, and removing it resets the event back to the AWS default.
 */
export interface TrustAnchorNotificationSetting {
    /**
     * The expiry event to notify on: `CA_CERTIFICATE_EXPIRY` or
     * `END_ENTITY_CERTIFICATE_EXPIRY`.
     */
    event: string;
    /**
     * Whether the notification is enabled.
     * @default true
     */
    enabled?: boolean;
    /**
     * How far ahead of the expiry event to notify, e.g. `"30 days"` (a bare
     * number is milliseconds). Rounded to whole days on the wire.
     * @default "45 days"
     */
    threshold?: Duration.Input;
    /**
     * The notification channel. `ALL` (the only channel today) sends through
     * both AWS Health Dashboard and email.
     * @default "ALL"
     */
    channel?: string;
}
export interface TrustAnchorProps {
    /**
     * Name of the trust anchor. If omitted, a unique name is generated from the
     * app, stage and logical ID. The name is updatable in place.
     */
    trustAnchorName?: string;
    /**
     * PEM-encoded CA certificate bundle establishing the trust root
     * (`CERTIFICATE_BUNDLE` source). Exactly one of `certificateBundle` or
     * `acmPcaArn` must be provided.
     */
    certificateBundle?: string;
    /**
     * ARN of an AWS Private CA (`AWS_ACM_PCA` source) establishing the trust
     * root. Exactly one of `certificateBundle` or `acmPcaArn` must be provided.
     */
    acmPcaArn?: string;
    /**
     * Whether the trust anchor is enabled for trust validation. When disabled,
     * temporary credential requests specifying this trust anchor are rejected.
     * @default true
     */
    enabled?: boolean;
    /**
     * Customized certificate-expiry notifications. Events omitted here keep
     * their AWS default notification; a setting previously managed by this
     * resource and later removed is reset to the AWS default.
     */
    notificationSettings?: TrustAnchorNotificationSetting[];
    /**
     * User-defined tags for the trust anchor.
     */
    tags?: Record<string, string>;
}
export interface TrustAnchor extends Resource<"AWS.RolesAnywhere.TrustAnchor", TrustAnchorProps, {
    /**
     * Unique ID of the trust anchor.
     */
    trustAnchorId: string;
    /**
     * ARN of the trust anchor.
     */
    trustAnchorArn: string;
    /**
     * Name of the trust anchor.
     */
    trustAnchorName: string;
    /**
     * Whether the trust anchor is enabled.
     */
    enabled: boolean;
}, never, Providers> {
}
/**
 * An IAM Roles Anywhere trust anchor. A trust anchor establishes trust
 * between IAM Roles Anywhere and your certificate authority (CA) — either an
 * uploaded PEM CA certificate bundle or a reference to an AWS Private CA.
 * Workloads outside AWS authenticate with certificates issued by the CA in
 * exchange for temporary AWS credentials.
 * ### Creating a Trust Anchor
 * **Example:** Certificate Bundle Trust Anchor
 * ```typescript
 * const anchor = yield* RolesAnywhere.TrustAnchor("Anchor", {
 *   certificateBundle: CA_CERTIFICATE_PEM,
 * });
 * ```
 *
 * **Example:** AWS Private CA Trust Anchor
 * ```typescript
 * const anchor = yield* RolesAnywhere.TrustAnchor("Anchor", {
 *   acmPcaArn: privateCa.certificateAuthorityArn,
 * });
 * ```
 *
 * ### Disabling a Trust Anchor
 * **Example:** Disabled Trust Anchor
 * ```typescript
 * const anchor = yield* RolesAnywhere.TrustAnchor("Anchor", {
 *   certificateBundle: CA_CERTIFICATE_PEM,
 *   enabled: false,
 * });
 * ```
 *
 * ### Expiry Notifications
 * **Example:** Custom Notification Threshold
 * ```typescript
 * const anchor = yield* RolesAnywhere.TrustAnchor("Anchor", {
 *   certificateBundle: CA_CERTIFICATE_PEM,
 *   notificationSettings: [
 *     { event: "CA_CERTIFICATE_EXPIRY", threshold: "30 days" },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export declare const TrustAnchor: import("../../Resource.ts").ResourceClass<TrustAnchor>;
export declare const TrustAnchorProvider: () => import("effect/Layer").Layer<Provider.Provider<TrustAnchor>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=TrustAnchor.d.ts.map