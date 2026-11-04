import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface CanaryProps {
    /**
     * Name of the canary. Must be lowercase, up to 255 characters, and match
     * `^[0-9a-z_-]+$`. Keep it to 21 characters or fewer so the derived Lambda
     * function name (`cwsyn-<name>-...`) stays within limits.
     * @default ${app}-${id}-${stage}-${suffix} (lowercased, truncated to 21 chars)
     */
    canaryName?: string;
    /**
     * Inline canary script source. For Node.js runtimes
     * (`syn-nodejs-puppeteer-*`, `syn-nodejs-playwright-*`) the script is
     * packaged as `nodejs/node_modules/<file>.js`; for Python runtimes
     * (`syn-python-selenium-*`) as `python/<file>.py`, where `<file>` is the
     * first segment of `handler`.
     */
    script: string;
    /**
     * The entry point of the canary script, `<fileName>.<functionName>`.
     * @default "index.handler"
     */
    handler?: string;
    /**
     * The Synthetics runtime version to use.
     * @default "syn-nodejs-puppeteer-16.1"
     */
    runtimeVersion?: string;
    /**
     * S3 location where the canary stores run artifacts (screenshots, HAR
     * files, logs), e.g. `s3://my-bucket/canary-artifacts`. The `s3://` prefix
     * is added automatically if missing.
     */
    artifactS3Location: string;
    /**
     * ARN of the IAM role the canary's Lambda assumes. When omitted, a role is
     * created automatically with write access to the artifact bucket,
     * CloudWatch Logs, and the `CloudWatchSynthetics` metric namespace.
     */
    executionRoleArn?: string;
    /**
     * How often the canary runs.
     */
    schedule?: {
        /**
         * A `rate(...)` expression (`rate(1 minute)` to `rate(1 hour)`), a
         * `cron(...)` expression, or `rate(0 minute)` to run only once when
         * started.
         * @default "rate(5 minutes)"
         */
        expression?: string;
        /**
         * How long the canary keeps running on this schedule after it starts
         * (up to 1 year), e.g. `"12 hours"` or `Duration.hours(12)` (a bare
         * number is milliseconds). Rounded to whole seconds on the wire.
         * `"0 seconds"` (or omitted) runs the canary continuously.
         */
        duration?: Duration.Input;
    };
    /**
     * Whether the canary is started (scheduled to run) after deployment.
     * When `false`, the canary is created in the `READY` state and never runs
     * until started.
     * @default false
     */
    start?: boolean;
    /**
     * Per-run configuration of the canary's Lambda.
     */
    runConfig?: {
        /**
         * Run timeout (max 840 seconds), e.g. `"60 seconds"` or
         * `Duration.minutes(1)` (a bare number is milliseconds). Rounded to
         * whole seconds on the wire. Defaults to the schedule frequency
         * capped at 14 minutes.
         */
        timeout?: Duration.Input;
        /**
         * Memory in MB (multiple of 64, between 960 and 3008).
         */
        memoryInMB?: number;
        /**
         * Enable X-Ray active tracing for canary runs.
         * @default false
         */
        activeTracing?: boolean;
        /**
         * Environment variables exposed to the canary script. Not observable
         * from the API after creation.
         */
        environmentVariables?: Record<string, string>;
    };
    /**
     * How long to retain data on successful runs (1 - 455 days), e.g.
     * `"7 days"` or `Duration.days(7)` (a bare number is milliseconds).
     * Rounded to whole days on the wire.
     * @default 31 days
     */
    successRetentionPeriod?: Duration.Input;
    /**
     * How long to retain data on failed runs (1 - 455 days), e.g.
     * `"31 days"` or `Duration.days(31)` (a bare number is milliseconds).
     * Rounded to whole days on the wire.
     * @default 31 days
     */
    failureRetentionPeriod?: Duration.Input;
    /**
     * Run the canary inside a VPC. Both fields are required together.
     */
    vpcConfig?: {
        /** Subnet IDs the canary's ENIs are placed in. */
        subnetIds: string[];
        /** Security group IDs applied to the canary's ENIs. */
        securityGroupIds: string[];
    };
    /**
     * Whether the Lambda function and layers backing the canary are deleted
     * automatically when the canary is deleted.
     * @default "AUTOMATIC"
     */
    provisionedResourceCleanup?: "AUTOMATIC" | "OFF";
    /**
     * Tags to apply to the canary. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Canary extends Resource<"AWS.Synthetics.Canary", CanaryProps, {
    /**
     * Physical name of the canary.
     */
    canaryName: string;
    /**
     * ARN of the canary.
     */
    canaryArn: string;
    /**
     * Service-assigned unique ID of the canary.
     */
    canaryId: string;
    /**
     * ARN of the IAM role the canary runs as.
     */
    executionRoleArn: string;
    /**
     * S3 location where run artifacts (screenshots, HAR files, logs) land.
     */
    artifactS3Location: string;
    /**
     * Synthetics runtime version the canary executes on.
     */
    runtimeVersion: string;
    /** Name of the auto-created execution role; `undefined` when the user supplied `executionRoleArn`. */
    roleName: string | undefined;
    /** Hash of the last-applied desired configuration; used to skip no-op updates. */
    configHash: string | undefined;
    /** Exact ARN of the service-created Lambda function backing the canary. */
    engineArn: string | undefined;
}, {}, Providers> {
}
/**
 * A CloudWatch Synthetics canary — a scripted probe that monitors your
 * endpoints and APIs on a schedule from the outside in.
 *
 * The canary script is provided inline and packaged automatically for the
 * chosen runtime. Unless you pass `executionRoleArn`, an IAM execution role
 * is created with least-privilege access to the artifact bucket, CloudWatch
 * Logs, and Synthetics metrics.
 * ### Creating Canaries
 * **Example:** Heartbeat Canary (created stopped)
 * ```typescript
 * import * as Synthetics from "alchemy/AWS/Synthetics";
 *
 * const canary = yield* Synthetics.Canary("Heartbeat", {
 *   script: `
 *     const synthetics = require("Synthetics");
 *     exports.handler = async () => {
 *       return await synthetics.executeStep("heartbeat", async () => {});
 *     };
 *   `,
 *   artifactS3Location: Output.interpolate`s3://${bucket.bucketName}/canary`,
 * });
 * ```
 *
 * **Example:** Started Canary on a Schedule
 * ```typescript
 * const canary = yield* Synthetics.Canary("ApiMonitor", {
 *   script: myCanaryScript,
 *   artifactS3Location: "s3://my-artifacts/api-monitor",
 *   schedule: { expression: "rate(5 minutes)" },
 *   start: true,
 * });
 * ```
 *
 * ### Configuration
 * **Example:** Custom Runtime, Timeout and Environment
 * ```typescript
 * const canary = yield* Synthetics.Canary("Checkout", {
 *   script: checkoutScript,
 *   runtimeVersion: "syn-nodejs-puppeteer-16.1",
 *   artifactS3Location: "s3://my-artifacts/checkout",
 *   runConfig: {
 *     timeout: "60 seconds",
 *     environmentVariables: { TARGET_URL: "https://example.com" },
 *   },
 *   successRetentionPeriod: "7 days",
 *   failureRetentionPeriod: "31 days",
 * });
 * ```
 *
 * **Example:** Bring Your Own Execution Role
 * ```typescript
 * const canary = yield* Synthetics.Canary("Probe", {
 *   script: probeScript,
 *   artifactS3Location: "s3://my-artifacts/probe",
 *   executionRoleArn: role.roleArn,
 * });
 * ```
 *
 * @resource
 */
export declare const Canary: import("../../Resource.ts").ResourceClass<Canary>;
declare const CanaryNotSettled_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "CanaryNotSettled";
} & Readonly<A>;
/**
 * Canary create/update/start/stop are asynchronous; the canary reports a
 * transitional state while converging. Raised internally to drive the
 * bounded settle-polling retry loop.
 */
export declare class CanaryNotSettled extends CanaryNotSettled_base<{
    canaryName: string;
    state: string | undefined;
}> {
}
declare const CanaryFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "CanaryFailed";
} & Readonly<A>;
/**
 * Raised when a canary lands in the `ERROR` state after a create or update
 * instead of converging to `READY`/`STOPPED`.
 */
export declare class CanaryFailed extends CanaryFailed_base<{
    canaryName: string;
    stateReasonCode: string | undefined;
    message: string;
}> {
}
export declare const CanaryProvider: () => import("effect/Layer").Layer<Provider.Provider<Canary>, never, any>;
export {};
//# sourceMappingURL=Canary.d.ts.map