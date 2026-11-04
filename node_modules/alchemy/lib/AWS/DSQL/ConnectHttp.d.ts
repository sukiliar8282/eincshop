import type * as Credentials from "@distilled.cloud/aws/Credentials";
import type * as Region from "@distilled.cloud/aws/Region";
import * as Layer from "effect/Layer";
import { Connect } from "./Connect.ts";
/**
 * IAM-token implementation of {@link Connect}. At deploy time it grants
 * `dsql:DbConnect` (or `dsql:DbConnectAdmin`) on the cluster to the host
 * Function and publishes the endpoint as `DSQL_{LOGICAL_ID}_HOST`; at runtime
 * it presigns a fresh auth token (client-side SigV4 — no API call) with the
 * Function's own credentials and formats the full connection descriptor.
 */
export declare const ConnectHttp: Layer.Layer<Connect, never, Credentials.Credentials | Region.Region>;
//# sourceMappingURL=ConnectHttp.d.ts.map