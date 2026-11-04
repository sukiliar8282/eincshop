import * as securitylake from "@distilled.cloud/aws/securitylake";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * The AWS identity (principal + external ID) that a subscriber authenticates
 * with when consuming data from Security Lake.
 */
export interface SubscriberIdentity {
    /** The AWS principal (account ID or service principal) of the subscriber. */
    principal: string;
    /** The external ID the subscriber must present when assuming the role. */
    externalId: string;
}
/**
 * A log source a subscriber consumes — either a natively supported AWS source
 * or a custom source.
 */
export type SubscriberSource = securitylake.LogSourceResource;
/**
 * How the subscriber accesses the data — direct S3 access or Lake Formation
 * (query) access.
 */
export type SubscriberAccessType = "LAKEFORMATION" | "S3";
export interface SubscriberProps {
    /**
     * Name of the subscriber. If omitted, a unique physical name is generated
     * from the app, stage, and logical ID.
     */
    subscriberName?: string;
    /**
     * The AWS identity (principal + external ID) the subscriber uses to access
     * Security Lake data.
     */
    subscriberIdentity: SubscriberIdentity;
    /**
     * Description of the subscriber.
     */
    subscriberDescription?: string;
    /**
     * The log sources the subscriber consumes, e.g.
     * `[{ awsLogSource: { sourceName: "ROUTE53", sourceVersion: "2.0" } }]`.
     */
    sources: SubscriberSource[];
    /**
     * How the subscriber accesses the data. Changing this replaces the
     * subscriber (access type is create-only).
     * @default ["S3"]
     */
    accessTypes?: SubscriberAccessType[];
    /**
     * Tags applied to the subscriber. Alchemy ownership tags are merged in
     * automatically.
     */
    tags?: Record<string, string>;
}
/** @resource */
export interface Subscriber extends Resource<"AWS.SecurityLake.Subscriber", SubscriberProps, {
    /** Unique ID of the subscriber (UUID). */
    subscriberId: string;
    /** ARN of the subscriber. */
    subscriberArn: string;
    /** Name of the subscriber. */
    subscriberName: string;
    /** Current status (`ACTIVE`, `PENDING`, `READY`, `DEACTIVATED`). */
    subscriberStatus: string | undefined;
    /** ARN of the IAM role created for the subscriber to assume. */
    roleArn: string | undefined;
    /** ARN of the S3 bucket the subscriber reads from. */
    s3BucketArn: string | undefined;
    /** The subscriber's notification endpoint, if one is configured. */
    subscriberEndpoint: string | undefined;
    /** ARN of the RAM resource share (Lake Formation access only). */
    resourceShareArn: string | undefined;
    /** Name of the RAM resource share (Lake Formation access only). */
    resourceShareName: string | undefined;
}, never, Providers> {
}
/**
 * A Security Lake subscriber — a consumer (account or service) granted access
 * to data in the Security Lake data lake for specific log sources.
 *
 * ### Creating a Subscriber
 * **Example:** S3 data-access subscriber
 * ```typescript
 * const subscriber = yield* SecurityLake.Subscriber("Analytics", {
 *   subscriberIdentity: {
 *     principal: "123456789012",
 *     externalId: "analytics-external-id",
 *   },
 *   sources: [{ awsLogSource: { sourceName: "ROUTE53", sourceVersion: "2.0" } }],
 * });
 * ```
 *
 * **Example:** Lake Formation (query) access
 * ```typescript
 * const subscriber = yield* SecurityLake.Subscriber("Athena", {
 *   subscriberName: "athena-consumer",
 *   subscriberDescription: "Athena query access to VPC flow logs",
 *   subscriberIdentity: {
 *     principal: "123456789012",
 *     externalId: "athena-external-id",
 *   },
 *   sources: [{ awsLogSource: { sourceName: "VPC_FLOW", sourceVersion: "2.0" } }],
 *   accessTypes: ["LAKEFORMATION"],
 *   tags: { team: "security" },
 * });
 * ```
 */
declare const SubscriberResource: import("../../Resource.ts").ResourceClass<Subscriber>;
export { SubscriberResource as Subscriber };
declare const SubscriberCreateFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SubscriberCreateFailed";
} & Readonly<A>;
/**
 * `CreateSubscriber` returned without a subscriber body and the subscriber
 * could not be re-observed by name.
 */
export declare class SubscriberCreateFailed extends SubscriberCreateFailed_base<{
    readonly subscriberName: string;
}> {
}
export declare const SubscriberProvider: () => import("effect/Layer").Layer<Provider.Provider<Subscriber>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Subscriber.d.ts.map