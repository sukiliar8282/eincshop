import * as auditmanager from "@distilled.cloud/aws/auditmanager";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
/**
 * Where Audit Manager stores generated assessment reports.
 */
export interface AssessmentReportsDestinationProps {
    /**
     * The destination type. Only `S3` is supported.
     * @default "S3"
     */
    destinationType?: auditmanager.AssessmentReportDestinationType;
    /**
     * The destination bucket, as an S3 URL (e.g. `s3://my-bucket`).
     */
    destination: string;
}
/**
 * An AWS account included in the scope of an assessment.
 */
export interface AssessmentScopeAccount {
    /**
     * The account id.
     */
    id: string;
}
/**
 * An AWS service included in the scope of an assessment.
 */
export interface AssessmentScopeService {
    /**
     * The service name (e.g. `s3`, `iam`).
     */
    serviceName: string;
}
/**
 * The accounts and services an assessment collects evidence for.
 */
export interface AssessmentScope {
    /**
     * The accounts in scope.
     */
    awsAccounts?: AssessmentScopeAccount[];
    /**
     * The services in scope. Omit to let Audit Manager infer services from
     * the in-scope accounts.
     */
    awsServices?: AssessmentScopeService[];
}
/**
 * A user or role responsible for an assessment.
 */
export interface AssessmentRole {
    /**
     * The role type — `PROCESS_OWNER` or `RESOURCE_OWNER`.
     */
    roleType: auditmanager.RoleType;
    /**
     * ARN of the IAM user or role.
     */
    roleArn: string;
}
export interface AssessmentProps {
    /**
     * Name of the assessment.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * A description of the assessment.
     */
    description?: string;
    /**
     * The unique identifier of the framework the assessment is created from.
     * Changing it replaces the assessment.
     */
    frameworkId: string;
    /**
     * Where generated assessment reports are stored.
     */
    assessmentReportsDestination: AssessmentReportsDestinationProps;
    /**
     * The accounts and services in scope.
     * @default the current account
     */
    scope?: AssessmentScope;
    /**
     * The users and roles responsible for the assessment.
     */
    roles: AssessmentRole[];
    /**
     * Tags to associate with the assessment.
     */
    tags?: Record<string, string>;
}
export interface Assessment extends Resource<"AWS.AuditManager.Assessment", AssessmentProps, {
    /**
     * Service-assigned unique identifier of the assessment.
     */
    assessmentId: string;
    /**
     * ARN of the assessment.
     */
    arn: string;
    /**
     * The assessment's name.
     */
    name: string;
    /**
     * Current status of the assessment (`ACTIVE` or `INACTIVE`).
     */
    status: auditmanager.AssessmentStatus | undefined;
    /**
     * The id of the framework the assessment was created from.
     */
    frameworkId: string;
    /**
     * Current tags reported for the assessment.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An AWS Audit Manager assessment — an active evidence-collection engagement
 * created from a framework, continuously gathering evidence for the controls
 * in scope.
 *
 * :::note
 * Audit Manager must be registered in the account (`RegisterAccount`)
 * before assessments can be created.
 * :::
 * ### Creating Assessments
 * **Example:** Assessment from a Custom Framework
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const reports = yield* AWS.S3.Bucket("AuditReports", {});
 *
 * const owner = yield* AWS.IAM.Role("AuditOwner", {
 *   assumeRolePolicyDocument: {
 *     Version: "2012-10-17",
 *     Statement: [{
 *       Effect: "Allow",
 *       Principal: { Service: "auditmanager.amazonaws.com" },
 *       Action: ["sts:AssumeRole"],
 *     }],
 *   },
 * });
 *
 * const assessment = yield* AWS.AuditManager.Assessment("Quarterly", {
 *   frameworkId: framework.frameworkId,
 *   assessmentReportsDestination: {
 *     destination: reports.bucketName.apply((name) => `s3://${name}`),
 *   },
 *   roles: [{ roleType: "PROCESS_OWNER", roleArn: owner.roleArn }],
 * });
 * ```
 *
 * @resource
 */
export declare const Assessment: import("../../Resource.ts").ResourceClass<Assessment>;
export declare const AssessmentProvider: () => import("effect/Layer").Layer<Provider.Provider<Assessment>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Assessment.d.ts.map