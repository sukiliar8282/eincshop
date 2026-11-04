import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ConfigurationProps {
    /**
     * Name of the configuration (1-150 chars, `a-z A-Z 0-9 . _ ~ -`). If
     * omitted a deterministic physical name is generated. The name is
     * immutable — changing it replaces the configuration.
     */
    configurationName?: string;
    /**
     * Broker engine the configuration targets. Immutable — changing it
     * replaces the configuration.
     */
    engineType: "ACTIVEMQ" | "RABBITMQ";
    /**
     * Broker engine version the configuration targets (e.g. `"5.18"` for
     * ActiveMQ, `"3.13"` for RabbitMQ). Immutable — changing it replaces the
     * configuration.
     */
    engineVersion?: string;
    /**
     * Authentication strategy for the associated broker. Immutable —
     * changing it replaces the configuration.
     * @default "SIMPLE"
     */
    authenticationStrategy?: "SIMPLE" | "LDAP";
    /**
     * The broker configuration document as plain text (ActiveMQ XML or
     * RabbitMQ Cuttlefish). Alchemy base64-encodes it for the API. Supplying
     * (or changing) `data` publishes a new configuration revision. Omitting
     * it keeps the engine's default revision.
     */
    data?: string;
    /**
     * Description recorded on the published revision. Only applied when `data`
     * is also supplied (the API updates data + description together).
     */
    description?: string;
    /**
     * User-defined tags for the configuration.
     */
    tags?: Record<string, string>;
}
export interface Configuration extends Resource<"AWS.MQ.Configuration", ConfigurationProps, {
    /** Server-assigned unique id of the configuration (e.g. `c-1234...`). */
    configurationId: string;
    /** ARN of the configuration. */
    configurationArn: string;
    /** Name of the configuration. */
    configurationName: string;
    /** Latest published revision number. */
    configurationRevision: number;
    /** Broker engine the configuration targets (`ACTIVEMQ` or `RABBITMQ`). */
    engineType: string;
    /** Engine version the configuration targets. */
    engineVersion: string | undefined;
}, never, Providers> {
}
/**
 * An Amazon MQ broker configuration — a versioned document (ActiveMQ XML or
 * RabbitMQ Cuttlefish) that a {@link Broker} can reference to control
 * engine-level settings. Each edit to `data` publishes a new immutable
 * revision; a broker pins a specific `{ id, revision }` pair.
 *
 * ### Creating a Configuration
 * **Example:** Default ActiveMQ Configuration
 * ```typescript
 * const config = yield* MQ.Configuration("BrokerConfig", {
 *   engineType: "ACTIVEMQ",
 *   engineVersion: "5.18",
 * });
 * ```
 *
 * **Example:** Custom ActiveMQ Configuration Document
 * ```typescript
 * const config = yield* MQ.Configuration("BrokerConfig", {
 *   engineType: "ACTIVEMQ",
 *   engineVersion: "5.18",
 *   description: "Enable statistics plugin",
 *   data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
 * <broker xmlns="http://activemq.apache.org/schema/core">
 *   <plugins>
 *     <statisticsBrokerPlugin/>
 *   </plugins>
 * </broker>`,
 * });
 * // config.configurationRevision -> 2 (the published revision)
 * ```
 *
 * ### Attaching to a Broker
 * **Example:** Reference a Configuration from a Broker
 * ```typescript
 * const broker = yield* MQ.Broker("Orders", {
 *   engineType: "ACTIVEMQ",
 *   engineVersion: "5.18",
 *   hostInstanceType: "mq.t3.micro",
 *   users: [{ username: "admin", password: Redacted.make("SuperSecretPassw0rd") }],
 *   configuration: {
 *     id: config.configurationId,
 *     revision: config.configurationRevision,
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Configuration: import("../../Resource.ts").ResourceClass<Configuration>;
export declare const ConfigurationProvider: () => import("effect/Layer").Layer<Provider.Provider<Configuration>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Configuration.d.ts.map