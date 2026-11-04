import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * A filter that narrows the resources selected by an experiment template
 * target using resource attribute paths.
 */
export interface ExperimentTemplateTargetFilter {
    /**
     * The attribute path used to filter, e.g. `State.Name` for EC2 instances.
     */
    path: string;
    /**
     * The attribute values that a resource must match to be included.
     */
    values: string[];
}
/**
 * A target definition for an experiment template — the set of resources an
 * action is applied to.
 */
export interface ExperimentTemplateTarget {
    /**
     * The resource type of the target, e.g. `aws:ec2:instance`.
     */
    resourceType: string;
    /**
     * ARNs of specific resources to target. Mutually exclusive with
     * `resourceTags`.
     */
    resourceArns?: string[];
    /**
     * Tags that resources must have to be targeted. Mutually exclusive with
     * `resourceArns`.
     */
    resourceTags?: Record<string, string>;
    /**
     * Filters that further narrow the targeted resources by attribute path,
     * e.g. only running instances.
     */
    filters?: ExperimentTemplateTargetFilter[];
    /**
     * How targets are selected from the matched resources, e.g. `ALL`,
     * `COUNT(1)`, or `PERCENT(25)`.
     */
    selectionMode: string;
    /**
     * Resource-type-specific parameters for the target.
     */
    parameters?: Record<string, string>;
}
/**
 * An action carried out on targets during an experiment, e.g.
 * `aws:ec2:stop-instances`.
 */
export interface ExperimentTemplateAction {
    /**
     * The FIS action ID, e.g. `aws:ec2:stop-instances` or
     * `aws:fis:wait`.
     */
    actionId: string;
    /**
     * A description of the action.
     */
    description?: string;
    /**
     * Action-specific parameters, e.g.
     * `{ startInstancesAfterDuration: "PT2M" }`.
     */
    parameters?: Record<string, string>;
    /**
     * The named targets (keys of the template's `targets` map) the action
     * applies to, keyed by the action's target name, e.g.
     * `{ Instances: "MyTarget" }`.
     */
    targets?: Record<string, string>;
    /**
     * Names of other actions that must complete before this action starts.
     */
    startAfter?: string[];
}
/**
 * A stop condition for an experiment. When triggered while an experiment is
 * running, the experiment is stopped.
 */
export interface ExperimentTemplateStopCondition {
    /**
     * The source of the stop condition: `aws:cloudwatch:alarm` or `none`.
     */
    source: "aws:cloudwatch:alarm" | "none" | (string & {});
    /**
     * The ARN of the CloudWatch alarm. Required when `source` is
     * `aws:cloudwatch:alarm`.
     */
    value?: string;
}
/**
 * Experiment log delivery configuration.
 */
export interface ExperimentTemplateLogConfiguration {
    /**
     * Deliver experiment logs to a CloudWatch Logs log group.
     */
    cloudWatchLogsConfiguration?: {
        /**
         * The ARN of the destination log group.
         */
        logGroupArn: string;
    };
    /**
     * Deliver experiment logs to an S3 bucket.
     */
    s3Configuration?: {
        /**
         * The name of the destination bucket.
         */
        bucketName: string;
        /**
         * The bucket prefix for delivered log objects.
         */
        prefix?: string;
    };
    /**
     * The schema version of delivered log records.
     * @default 2
     */
    logSchemaVersion?: number;
}
/**
 * Experiment options controlling account targeting and empty-target
 * behavior.
 */
export interface ExperimentTemplateExperimentOptions {
    /**
     * Whether the experiment targets resources in the current account only or
     * across multiple accounts. Changing this replaces the template.
     * @default "single-account"
     */
    accountTargeting?: "single-account" | "multi-account";
    /**
     * What happens when a target resolves to zero resources: `fail` the
     * experiment or `skip` the action.
     * @default "fail"
     */
    emptyTargetResolutionMode?: "fail" | "skip";
}
/**
 * Experiment report configuration.
 */
export interface ExperimentTemplateReportConfiguration {
    /**
     * Where the experiment report is delivered.
     */
    outputs?: {
        /**
         * Deliver the report to an S3 bucket.
         */
        s3Configuration?: {
            /**
             * The name of the destination bucket.
             */
            bucketName?: string;
            /**
             * The bucket prefix for the delivered report.
             */
            prefix?: string;
        };
    };
    /**
     * Data sources included in the report.
     */
    dataSources?: {
        /**
         * CloudWatch dashboards to capture in the report.
         */
        cloudWatchDashboards?: {
            /**
             * The ARN of the CloudWatch dashboard.
             */
            dashboardIdentifier?: string;
        }[];
    };
    /**
     * How long before the experiment to capture data, e.g. `"10 minutes"` or
     * `Duration.minutes(10)`. Sent to FIS as an ISO-8601 duration (`PT10M`).
     */
    preExperimentDuration?: Duration.Input;
    /**
     * How long after the experiment to capture data, e.g. `"10 minutes"` or
     * `Duration.minutes(10)`. Sent to FIS as an ISO-8601 duration (`PT10M`).
     */
    postExperimentDuration?: Duration.Input;
}
export interface ExperimentTemplateProps {
    /**
     * A description of the experiment template.
     * @default the logical ID of the resource
     */
    description?: string;
    /**
     * The ARN of the IAM role that grants FIS permission to perform the
     * template's actions on your behalf. The role must trust
     * `fis.amazonaws.com`.
     */
    roleArn: string;
    /**
     * The actions carried out during an experiment, keyed by a name of your
     * choosing.
     */
    actions: Record<string, ExperimentTemplateAction>;
    /**
     * The targets the actions apply to, keyed by a name of your choosing and
     * referenced from each action's `targets` map.
     */
    targets?: Record<string, ExperimentTemplateTarget>;
    /**
     * Stop conditions that halt a running experiment when triggered.
     * @default [{ source: "none" }]
     */
    stopConditions?: ExperimentTemplateStopCondition[];
    /**
     * Experiment log delivery configuration. Once configured, log delivery
     * cannot be fully removed via the API — only changed.
     */
    logConfiguration?: ExperimentTemplateLogConfiguration;
    /**
     * Experiment options. `accountTargeting` is create-only — changing it
     * replaces the template.
     */
    experimentOptions?: ExperimentTemplateExperimentOptions;
    /**
     * Experiment report configuration.
     */
    experimentReportConfiguration?: ExperimentTemplateReportConfiguration;
    /**
     * Tags to apply to the experiment template. Merged with internal Alchemy
     * tags.
     */
    tags?: Record<string, string>;
}
export interface ExperimentTemplate extends Resource<"AWS.FIS.ExperimentTemplate", ExperimentTemplateProps, {
    /**
     * The generated ID of the experiment template, e.g. `EXT1a2b3c4d`.
     */
    id: string;
    /**
     * The ARN of the experiment template.
     */
    arn: string;
    /**
     * The ARN of the IAM role the experiment runs as.
     */
    roleArn: string;
}, never, Providers> {
}
/**
 * An AWS Fault Injection Service (FIS) experiment template — a reusable
 * definition of a chaos-engineering experiment: the targets to disrupt, the
 * fault actions to run against them, and the stop conditions that abort a
 * runaway experiment.
 *
 * Creating a template is free and does not disrupt any resources — faults
 * are only injected when an experiment is explicitly started from the
 * template.
 * ### Creating Experiment Templates
 * **Example:** Stop EC2 instances selected by tag
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const role = yield* AWS.IAM.Role("FisRole", {
 *   assumeRolePolicyDocument: {
 *     Version: "2012-10-17",
 *     Statement: [{
 *       Effect: "Allow",
 *       Principal: { Service: "fis.amazonaws.com" },
 *       Action: ["sts:AssumeRole"],
 *     }],
 *   },
 *   managedPolicyArns: [
 *     "arn:aws:iam::aws:policy/service-role/AWSFaultInjectionSimulatorEC2Access",
 *   ],
 * });
 *
 * const template = yield* AWS.FIS.ExperimentTemplate("StopInstances", {
 *   description: "Stop one tagged instance for two minutes",
 *   roleArn: role.roleArn,
 *   targets: {
 *     Instances: {
 *       resourceType: "aws:ec2:instance",
 *       resourceTags: { ChaosReady: "true" },
 *       selectionMode: "COUNT(1)",
 *     },
 *   },
 *   actions: {
 *     StopInstances: {
 *       actionId: "aws:ec2:stop-instances",
 *       parameters: { startInstancesAfterDuration: "PT2M" },
 *       targets: { Instances: "Instances" },
 *     },
 *   },
 * });
 * ```
 *
 * **Example:** Stop condition backed by a CloudWatch alarm
 * ```typescript
 * const template = yield* AWS.FIS.ExperimentTemplate("GuardedExperiment", {
 *   roleArn: role.roleArn,
 *   targets: {
 *     Instances: {
 *       resourceType: "aws:ec2:instance",
 *       resourceTags: { ChaosReady: "true" },
 *       selectionMode: "ALL",
 *     },
 *   },
 *   actions: {
 *     StopInstances: {
 *       actionId: "aws:ec2:stop-instances",
 *       targets: { Instances: "Instances" },
 *     },
 *   },
 *   stopConditions: [
 *     {
 *       source: "aws:cloudwatch:alarm",
 *       value: alarmArn,
 *     },
 *   ],
 * });
 * ```
 *
 * **Example:** Wait action sequenced after a fault
 * ```typescript
 * const template = yield* AWS.FIS.ExperimentTemplate("SequencedExperiment", {
 *   roleArn: role.roleArn,
 *   actions: {
 *     Wait: {
 *       actionId: "aws:fis:wait",
 *       parameters: { duration: "PT1M" },
 *     },
 *     WaitAgain: {
 *       actionId: "aws:fis:wait",
 *       parameters: { duration: "PT1M" },
 *       startAfter: ["Wait"],
 *     },
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const ExperimentTemplate: import("../../Resource.ts").ResourceClass<ExperimentTemplate>;
export declare const ExperimentTemplateProvider: () => import("effect/Layer").Layer<Provider.Provider<ExperimentTemplate>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ExperimentTemplate.d.ts.map