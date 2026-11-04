import * as Layer from "effect/Layer";
import { DescribeVirtualCluster } from "./DescribeVirtualCluster.ts";
/**
 * Bespoke (not scaffold-built): `describeVirtualCluster` addresses the
 * virtual cluster itself via `id` rather than carrying a `virtualClusterId`
 * field, and the grant is on the cluster ARN alone (no sub-resource
 * pattern).
 */
export declare const DescribeVirtualClusterHttp: Layer.Layer<DescribeVirtualCluster, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=DescribeVirtualClusterHttp.d.ts.map