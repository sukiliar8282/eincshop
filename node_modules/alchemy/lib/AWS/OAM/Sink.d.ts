import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface SinkProps {
    /**
     * Name of the sink. If omitted, a unique name is generated from the app,
     * stage and logical ID. Changing the name replaces the sink.
     */
    sinkName?: string;
    /**
     * The IAM resource policy that grants source accounts permission to link
     * to this sink (`oam:CreateLink` / `oam:UpdateLink`). Provided as a JSON
     * string or a plain policy document object.
     *
     * OAM has no delete-sink-policy API, so removing this prop leaves the
     * last applied policy in place.
     */
    policy?: string | Record<string, any>;
    /**
     * User tags to attach to the sink. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Sink extends Resource<"AWS.OAM.Sink", SinkProps, {
    /** The name of the sink. */
    sinkName: string;
    /** The ARN of the sink (used as the `sinkIdentifier` of a `Link`). */
    sinkArn: string;
    /** The random ID string that AWS generated as part of the sink ARN. */
    sinkId: string;
}, never, Providers> {
}
/**
 * A CloudWatch cross-account observability **sink** — the attachment point
 * in a monitoring account that source accounts link to in order to share
 * metrics, logs, traces, and Application Signals data.
 *
 * Each account can contain **one sink per region**. After creating a sink,
 * attach a sink policy (the `policy` prop) that authorizes source accounts
 * (or an entire organization) to create links to it.
 *
 * ### Creating a Sink
 * **Example:** Basic Sink
 * ```typescript
 * import * as OAM from "alchemy/AWS/OAM";
 *
 * const sink = yield* OAM.Sink("MonitoringSink");
 * ```
 *
 * **Example:** Sink with a policy authorizing source accounts
 * ```typescript
 * const sink = yield* OAM.Sink("MonitoringSink", {
 *   policy: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         Principal: { AWS: ["111122223333"] },
 *         Action: ["oam:CreateLink", "oam:UpdateLink"],
 *         Resource: "*",
 *         Condition: {
 *           "ForAllValues:StringEquals": {
 *             "oam:ResourceTypes": [
 *               "AWS::CloudWatch::Metric",
 *               "AWS::Logs::LogGroup",
 *             ],
 *           },
 *         },
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * **Example:** Authorize an entire organization
 * ```typescript
 * const sink = yield* OAM.Sink("OrgSink", {
 *   policy: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         Principal: "*",
 *         Action: ["oam:CreateLink", "oam:UpdateLink"],
 *         Resource: "*",
 *         Condition: {
 *           "ForAnyValue:StringEquals": { "aws:PrincipalOrgID": "o-xxxxxxxxxx" },
 *         },
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Sink: import("../../Resource.ts").ResourceClass<Sink>;
export declare const SinkProvider: () => import("effect/Layer").Layer<Provider.Provider<Sink>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Sink.d.ts.map