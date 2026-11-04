import * as connectivity from "@distilled.cloud/cloudflare/connectivity";
import * as Output from "../../Output.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import { type Attributes } from "./VpcService.ts";
export type VpcServiceLookupProps = {
    /**
     * The Cloudflare-assigned ID for the VPC service.
     */
    serviceId: string;
} | {
    /**
     * The display name of the VPC service.
     */
    name: string;
};
/**
 * The resolved value of a {@link lookup} — the service's {@link Attributes}
 * branded with the VpcService resource `Type`, so Worker binding
 * classification treats it exactly like the managed resource.
 */
export interface VpcServiceLookup extends Attributes {
    readonly Type: "Cloudflare.VpcService.VpcService";
}
/**
 * Look up an existing Cloudflare VPC service (managed outside this stack)
 * without managing its lifecycle — the data-source form (what Terraform
 * calls a data source and Pulumi an invoke). Reads the service by
 * `serviceId` or `name` and returns an `Output` of its {@link Attributes},
 * resolved during plan/deploy and inert inside deployed bundles. Place it
 * in a Worker's `env` to attach a `vpc_service` binding.
 * **Example:** Look up by ID
 * ```typescript
 * const service = Cloudflare.VpcService.lookup({
 *   serviceId: "123e4567-e89b-12d3-a456-426614174000",
 * });
 * ```
 *
 * **Example:** Look up by name
 * ```typescript
 * const service = Cloudflare.VpcService.lookup({ name: "my-vpc-service" });
 * ```
 *
 * **Example:** Bind to a Worker
 * ```typescript
 * const worker = yield* Cloudflare.Worker("Worker", {
 *   main: "./src/worker.ts",
 *   env: { VPC: Cloudflare.VpcService.lookup({ name: "my-vpc-service" }) },
 * });
 * ```
 *
 * @resource
 * @product Workers VPC
 * @category Network
 */
export declare const lookup: (props: VpcServiceLookupProps) => Output.ObjectExpr<{
    serviceId: string;
    serviceName: string;
    serviceType: "http" | "tcp";
    httpPort: number | undefined;
    httpsPort: number | undefined;
    host: import("./VpcService.ts").VpcService.Host;
    accountId: string;
    createdAt: number | undefined;
    updatedAt: number | undefined;
    readonly Type: "Cloudflare.VpcService.VpcService";
}, CloudflareEnvironment | connectivity.CloudflareOpContext>;
//# sourceMappingURL=VpcServiceLookup.d.ts.map