import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { PolicyDocument } from "../IAM/Policy.ts";
import type { Providers } from "../Providers.ts";
export interface DestinationProps {
    /**
     * Name of the destination. The destination name is its identity within the
     * account and region (put semantics upsert by name). If omitted, a unique
     * name is generated. Changing this value replaces the destination.
     */
    destinationName?: string;
    /**
     * ARN of the physical target that receives the log events — a Kinesis
     * stream in this account.
     */
    targetArn: string;
    /**
     * ARN of an IAM role that CloudWatch Logs assumes to write to the target.
     * The role must trust `logs.amazonaws.com`.
     */
    roleArn: string;
    /**
     * Access policy governing which accounts may create subscription filters
     * against this destination, either as a JSON string or a structured
     * document. Required before another account can subscribe.
     */
    accessPolicy?: PolicyDocument | string;
}
export interface Destination extends Resource<"AWS.Logs.Destination", DestinationProps, {
    destinationName: string;
    destinationArn: string;
    targetArn: string;
    roleArn: string;
    accessPolicy?: string;
}, never, Providers> {
}
/**
 * A CloudWatch Logs destination — a cross-account subscription target that
 * forwards log events to a Kinesis stream. Producers in other accounts create
 * subscription filters whose `destinationArn` points at this destination;
 * the `accessPolicy` controls which accounts may subscribe.
 * ### Cross-Account Log Fan-Out
 * **Example:** Kinesis-Backed Destination
 * ```typescript
 * const destination = yield* Destination("CentralLogs", {
 *   targetArn: stream.streamArn,
 *   roleArn: role.roleArn,
 *   accessPolicy: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         Principal: { AWS: "123456789012" },
 *         Action: ["logs:PutSubscriptionFilter"],
 *         Resource: "*",
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Destination: import("../../Resource.ts").ResourceClass<Destination>;
export declare const DestinationProvider: () => import("effect/Layer").Layer<Provider.Provider<Destination>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Destination.d.ts.map