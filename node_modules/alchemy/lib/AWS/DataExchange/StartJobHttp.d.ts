import * as Layer from "effect/Layer";
import { StartJob } from "./StartJob.ts";
/**
 * Bespoke implementation (not the shared account builder): a started job
 * runs with the caller's forwarded permissions, so on top of the
 * `dataexchange:*` actions it needs S3 access to AWS Data Exchange's own
 * service buckets (`arn:aws:s3:::*aws-data-exchange*`) — import jobs write
 * staged assets there (`s3:PutObject`/`s3:PutObjectAcl`), export jobs read
 * them (`s3:GetObject`). Mirrors the AWS-managed
 * `AWSDataExchangeProviderFullAccess` policy, including the `aws:CalledVia`
 * condition that limits the S3 grant to calls made through Data Exchange.
 */
export declare const StartJobHttp: Layer.Layer<StartJob, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=StartJobHttp.d.ts.map