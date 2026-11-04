import type { Input } from "../../Input.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import type { Listener, ListenerArn } from "./Listener.ts";
export interface ListenerCertificateProps {
    /** The HTTPS/TLS listener to attach the certificate to. Changing it replaces the attachment. */
    listenerArn: Input<ListenerArn> | Listener;
    /** The ARN of the ACM (or IAM) certificate to add to the listener's SNI certificate list. Changing it replaces the attachment. */
    certificateArn: string;
}
export interface ListenerCertificate extends Resource<"AWS.ELBv2.ListenerCertificate", ListenerCertificateProps, {
    /** The ARN of the listener the certificate is attached to. */
    listenerArn: ListenerArn;
    /** The ARN of the ACM/IAM certificate. */
    certificateArn: string;
}, never, Providers> {
}
/**
 * Attaches an additional SNI certificate to an ELBv2 HTTPS/TLS listener. The
 * listener's default certificate is configured on the {@link Listener} itself;
 * `ListenerCertificate` adds extra certificates that the load balancer selects
 * via Server Name Indication (SNI) based on the requested hostname.
 *
 * Use this resource when the certificates are managed independently of the
 * listener (e.g. one certificate per tenant domain). When the full certificate
 * list is known up front, prefer the listener's `certificates` prop, which
 * declaratively syncs the whole set.
 * ### Attaching Certificates
 * **Example:** Additional SNI certificate
 * ```typescript
 * const listener = yield* Listener("https", {
 *   loadBalancerArn: lb.loadBalancerArn,
 *   targetGroupArn: tg.targetGroupArn,
 *   port: 443,
 *   protocol: "HTTPS",
 *   certificateArn: defaultCertArn,
 * });
 * yield* ListenerCertificate("tenant-cert", {
 *   listenerArn: listener.listenerArn,
 *   certificateArn: tenantCertArn,
 * });
 * ```
 *
 * @resource
 */
export declare const ListenerCertificate: import("../../Resource.ts").ResourceClass<ListenerCertificate>;
export declare const ListenerCertificateProvider: () => import("effect/Layer").Layer<Provider.Provider<ListenerCertificate>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ListenerCertificate.d.ts.map