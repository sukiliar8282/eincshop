import type * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * An ActiveMQ or RabbitMQ user provisioned on the broker at creation.
 */
export interface BrokerUser {
    /**
     * Username (2-100 chars, `a-z A-Z 0-9 _ ~ . -`). Must not contain commas,
     * colons, equals signs, or the string `tag:`.
     */
    username: string;
    /**
     * Password (12-250 printable chars, no commas, colons, or equals signs).
     */
    password: Redacted.Redacted<string>;
    /**
     * Whether the user can access the ActiveMQ Web Console. Ignored for
     * RabbitMQ.
     * @default false
     */
    consoleAccess?: boolean;
    /**
     * ActiveMQ groups the user belongs to. Ignored for RabbitMQ.
     */
    groups?: string[];
}
/**
 * Reference to a specific {@link Configuration} revision to apply to the
 * broker.
 */
export interface BrokerConfigurationRef {
    /** The configuration id (`configurationId` attribute of a Configuration). */
    id: string;
    /** The revision number to apply. */
    revision?: number;
}
/**
 * CloudWatch log exports to enable for the broker.
 */
export interface BrokerLogs {
    /** Enable audit logging (ActiveMQ only). */
    audit?: boolean;
    /** Enable general logging. */
    general?: boolean;
}
/**
 * Weekly maintenance window during which the broker applies pending changes.
 */
export interface BrokerMaintenanceWindow {
    /** Day of week, e.g. `"SUNDAY"`. */
    dayOfWeek: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
    /** Start time in 24h `HH:mm` format, e.g. `"03:00"`. */
    timeOfDay: string;
    /** IANA time zone, e.g. `"UTC"`. */
    timeZone?: string;
}
/**
 * At-rest encryption options for the broker.
 */
export interface BrokerEncryptionOptions {
    /** Customer-managed KMS key id/ARN. Omit to use an AWS-owned key. */
    kmsKeyId?: string;
    /** Use an AWS-owned key rather than a customer-managed one. */
    useAwsOwnedKey?: boolean;
}
export interface BrokerProps {
    /**
     * Name of the broker (1-50 chars, `a-z A-Z 0-9 _ ~ -`). If omitted a
     * deterministic physical name is generated. Immutable — changing it
     * replaces the broker.
     */
    brokerName?: string;
    /**
     * Broker engine. Immutable — changing it replaces the broker.
     */
    engineType: "ACTIVEMQ" | "RABBITMQ";
    /**
     * Broker engine version (e.g. `"5.18"` for ActiveMQ, `"3.13"` for
     * RabbitMQ). Mutable — a change is applied as a pending broker update.
     */
    engineVersion?: string;
    /**
     * Broker instance type, e.g. `"mq.t3.micro"` (the cheapest) or
     * `"mq.m5.large"`. Mutable — a change is applied as a pending broker
     * update.
     */
    hostInstanceType: string;
    /**
     * Deployment topology. `SINGLE_INSTANCE` is a single broker (cheapest,
     * no HA); `ACTIVE_STANDBY_MULTI_AZ` (ActiveMQ) and `CLUSTER_MULTI_AZ`
     * (RabbitMQ) provide HA. Immutable — changing it replaces the broker.
     * @default "SINGLE_INSTANCE"
     */
    deploymentMode?: "SINGLE_INSTANCE" | "ACTIVE_STANDBY_MULTI_AZ" | "CLUSTER_MULTI_AZ";
    /**
     * Broker users. ActiveMQ requires at least one; RabbitMQ requires exactly
     * one. Users are provisioned at creation and are not reconciled on update.
     */
    users: BrokerUser[];
    /**
     * Whether the broker is reachable over the public internet. Immutable —
     * changing it replaces the broker.
     * @default false
     */
    publiclyAccessible?: boolean;
    /**
     * Subnet ids to deploy the broker into. `SINGLE_INSTANCE` needs one
     * subnet; multi-AZ needs two (ActiveMQ) or three (RabbitMQ cluster). If
     * omitted, a default-VPC subnet is chosen. Immutable — changing it
     * replaces the broker.
     */
    subnetIds?: string[];
    /**
     * Security group ids controlling access to the broker. Mutable — a change
     * is applied as a pending broker update.
     */
    securityGroups?: string[];
    /**
     * Authentication strategy. Mutable — a change is applied as a pending
     * broker update.
     * @default "SIMPLE"
     */
    authenticationStrategy?: "SIMPLE" | "LDAP";
    /**
     * Whether to automatically apply minor engine version upgrades during the
     * maintenance window. RabbitMQ and newer ActiveMQ versions require `true`.
     * Mutable.
     * @default true
     */
    autoMinorVersionUpgrade?: boolean;
    /**
     * Storage type. `EBS` (durable, default) or `EFS` (ActiveMQ multi-AZ
     * only). Immutable — changing it replaces the broker.
     */
    storageType?: "EBS" | "EFS";
    /**
     * A {@link Configuration} revision to apply. Mutable — a change is applied
     * as a pending broker update.
     */
    configuration?: BrokerConfigurationRef;
    /**
     * CloudWatch log exports. Mutable.
     */
    logs?: BrokerLogs;
    /**
     * Weekly maintenance window. Mutable.
     */
    maintenanceWindow?: BrokerMaintenanceWindow;
    /**
     * At-rest encryption options. Immutable — changing it replaces the broker.
     */
    encryptionOptions?: BrokerEncryptionOptions;
    /**
     * User-defined tags for the broker.
     */
    tags?: Record<string, string>;
}
export interface Broker extends Resource<"AWS.MQ.Broker", BrokerProps, {
    /** Server-assigned unique id of the broker (e.g. `b-1234...`). */
    brokerId: string;
    /** ARN of the broker. */
    brokerArn: string;
    /** Name of the broker. */
    brokerName: string;
    /** Current lifecycle state (e.g. `CREATION_IN_PROGRESS`, `RUNNING`). */
    brokerState: string;
    /** Wire-level connection endpoints (protocol URIs) for the broker. */
    endpoints: string[] | undefined;
    /** ActiveMQ Web Console URL (undefined for RabbitMQ). */
    consoleUrl: string | undefined;
}, never, Providers> {
}
/**
 * An Amazon MQ broker — a managed message broker running Apache ActiveMQ or
 * RabbitMQ. Amazon MQ handles provisioning, patching, and (for multi-AZ
 * deployments) failover, exposing standard wire protocols (OpenWire, AMQP,
 * MQTT, STOMP, WSS) so existing clients connect unchanged.
 *
 * Broker creation and deletion are asynchronous and take several minutes;
 * the provider waits (bounded) for the broker to reach `RUNNING` before
 * returning, and waits for it to disappear on delete.
 *
 * ### Creating a Broker
 * **Example:** Single-instance ActiveMQ (cheapest)
 * ```typescript
 * const broker = yield* MQ.Broker("Orders", {
 *   engineType: "ACTIVEMQ",
 *   engineVersion: "5.18",
 *   hostInstanceType: "mq.t3.micro",
 *   deploymentMode: "SINGLE_INSTANCE",
 *   publiclyAccessible: true,
 *   users: [{ username: "admin", password: Redacted.make("SuperSecretPassw0rd") }],
 * });
 * // broker.endpoints -> ["ssl://b-xxxx-1.mq.us-west-2.amazonaws.com:61617", ...]
 * ```
 *
 * **Example:** Single-instance RabbitMQ
 * ```typescript
 * const broker = yield* MQ.Broker("Events", {
 *   engineType: "RABBITMQ",
 *   engineVersion: "3.13",
 *   hostInstanceType: "mq.t3.micro",
 *   publiclyAccessible: true,
 *   users: [{ username: "admin", password: Redacted.make("SuperSecretPassw0rd") }],
 * });
 * ```
 *
 * ### Networking and Encryption
 * **Example:** Private broker in specific subnets with a customer KMS key
 * ```typescript
 * const broker = yield* MQ.Broker("Orders", {
 *   engineType: "ACTIVEMQ",
 *   engineVersion: "5.18",
 *   hostInstanceType: "mq.m5.large",
 *   deploymentMode: "ACTIVE_STANDBY_MULTI_AZ",
 *   publiclyAccessible: false,
 *   subnetIds: [subnetA.subnetId, subnetB.subnetId],
 *   securityGroups: [group.groupId],
 *   encryptionOptions: { kmsKeyId: key.keyArn },
 *   users: [{ username: "admin", password: Redacted.make("SuperSecretPassw0rd") }],
 * });
 * ```
 *
 * ### Logging and Maintenance
 * **Example:** Enable CloudWatch logs and pin a maintenance window
 * ```typescript
 * const broker = yield* MQ.Broker("Orders", {
 *   engineType: "ACTIVEMQ",
 *   engineVersion: "5.18",
 *   hostInstanceType: "mq.t3.micro",
 *   users: [{ username: "admin", password: Redacted.make("SuperSecretPassw0rd") }],
 *   logs: { general: true, audit: true },
 *   maintenanceWindow: {
 *     dayOfWeek: "SUNDAY",
 *     timeOfDay: "03:00",
 *     timeZone: "UTC",
 *   },
 * });
 * ```
 *
 * ### Consuming Messages
 * Subscribe a Lambda function to broker queues from the init phase via
 * {@link consumeBrokerMessages}. The event-source mapping, IAM grants, and
 * runtime dispatch are created automatically (provide
 * `Lambda.BrokerEventSource` on the function).
 *
 * **Example:** Process queue messages in a Lambda function
 * ```typescript
 * // init
 * yield* MQ.consumeBrokerMessages(
 *   broker,
 *   {
 *     queues: ["orders"],
 *     credentialsSecretArn: secret.secretArn,
 *   },
 *   (messages) =>
 *     messages.pipe(
 *       Stream.runForEach((message) =>
 *         Effect.log(`received: ${message.data}`),
 *       ),
 *     ),
 * );
 * ```
 *
 * @resource
 */
export declare const Broker: import("../../Resource.ts").ResourceClass<Broker>;
export declare const BrokerProvider: () => import("effect/Layer").Layer<Provider.Provider<Broker>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Broker.d.ts.map