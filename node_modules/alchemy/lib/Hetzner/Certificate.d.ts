import { Services } from "@distilled.cloud/hetzner";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import type { Providers } from "./Providers.ts";
export type CertificateType = "uploaded" | "managed";
export type CertificateStatus = {
    /** Let's Encrypt issuance state. `undefined` for uploaded Certificates. */
    issuance?: "pending" | "completed" | "failed" | (string & {});
    /** Let's Encrypt renewal state. `undefined` for uploaded Certificates. */
    renewal?: "scheduled" | "pending" | "failed" | "unavailable" | (string & {});
    /** Present when issuance or renewal is `failed`. */
    error?: {
        code?: string;
        message?: string;
    };
};
export type UploadedCertificateProps = {
    /**
     * Upload an existing PEM certificate and private key. You monitor
     * expiry and handle renewal yourself.
     * @default "uploaded"
     */
    type?: "uploaded";
    /**
     * Name of the Certificate. Must be unique per Hetzner project. If
     * omitted, a unique name is generated from the stack, stage, and
     * logical id.
     */
    name?: string;
    /**
     * Certificate and chain in PEM format, in order so that each record
     * directly certifies the one preceding. Changing it replaces the
     * Certificate.
     */
    certificate: string;
    /**
     * Certificate private key in PEM format. Never returned by the API
     * and not stored in resource attributes. Changing it replaces the
     * Certificate.
     */
    privateKey: string;
    /**
     * User-defined labels (`key/value` pairs). Alchemy ownership labels
     * are merged in automatically.
     */
    labels?: Record<string, string>;
};
export type ManagedCertificateProps = {
    /**
     * Request a Let's Encrypt Certificate for `domainNames`. Only domains
     * managed by Hetzner DNS are supported. Hetzner handles renewal.
     */
    type: "managed";
    /**
     * Name of the Certificate. Must be unique per Hetzner project. If
     * omitted, a unique name is generated from the stack, stage, and
     * logical id.
     */
    name?: string;
    /**
     * Domains and subdomains that should be contained in the Certificate.
     * Changing them replaces the Certificate.
     */
    domainNames: string[];
    /**
     * User-defined labels (`key/value` pairs). Alchemy ownership labels
     * are merged in automatically.
     */
    labels?: Record<string, string>;
};
export type CertificateProps = UploadedCertificateProps | ManagedCertificateProps;
export type Certificate = Resource<"Hetzner.Certificate", CertificateProps, {
    /** Numeric Hetzner Certificate id. */
    id: number;
    /** Name of the Certificate (unique per project). */
    name: string;
    /** `uploaded` or `managed`. */
    type: CertificateType;
    /**
     * Certificate and chain in PEM format. `undefined` while a managed
     * Certificate is still being issued.
     */
    certificate: string | undefined;
    /** SHA256 fingerprint of the Certificate. */
    fingerprint: string | undefined;
    /** Domains and subdomains covered by the Certificate. */
    domainNames: string[];
    /** RFC3339 instant when the Certificate becomes valid. */
    notValidBefore: string | undefined;
    /** RFC3339 instant when the Certificate stops being valid. */
    notValidAfter: string | undefined;
    /** RFC3339 creation timestamp. */
    created: string;
    /** User-defined labels (Alchemy ownership labels stripped). */
    labels: Record<string, string>;
    /** Managed issuance/renewal status. `undefined` for uploaded Certificates. */
    status: CertificateStatus | undefined;
    /** Resources currently using the Certificate. */
    usedBy: {
        id: number;
        type: string;
    }[];
}, never, Providers>;
/**
 * A Hetzner Cloud TLS Certificate. Upload a PEM (`type: "uploaded"`, the
 * default) or request a Let's Encrypt Certificate for domains in Hetzner
 * DNS (`type: "managed"`).
 *
 * `name` and `labels` update in place. Changing the type, the uploaded
 * PEM/key, or the managed domain list replaces the Certificate.
 *
 * @see https://docs.hetzner.cloud/reference/cloud#certificates
 *
 * ### Uploading a Certificate
 * **Example:** Generated name
 * ```typescript
 * const cert = yield* Hetzner.Certificate("web", {
 *   certificate: pem,
 *   privateKey: key,
 * });
 * ```
 *
 * **Example:** Explicit name and labels
 * ```typescript
 * const cert = yield* Hetzner.Certificate("web", {
 *   name: "my-website-cert",
 *   certificate: pem,
 *   privateKey: key,
 *   labels: { env: "prod" },
 * });
 * ```
 *
 * ### Managed Let's Encrypt
 * **Example:** Issue for Hetzner DNS domains
 * ```typescript
 * const cert = yield* Hetzner.Certificate("le", {
 *   type: "managed",
 *   domainNames: ["example.com", "www.example.com"],
 * });
 * ```
 *
 * @resource
 */
export declare const Certificate: import("../Resource.ts").ResourceClass<Certificate>;
declare const CertificateNotResolved_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Hetzner.CertificateNotResolved";
} & Readonly<A>;
export declare class CertificateNotResolved extends CertificateNotResolved_base<{
    name: string;
}> {
}
declare const CertificateIssuancePending_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Hetzner.CertificateIssuancePending";
} & Readonly<A>;
export declare class CertificateIssuancePending extends CertificateIssuancePending_base<{
    certificateId: number;
    issuance: string;
}> {
}
declare const CertificateIssuanceFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Hetzner.CertificateIssuanceFailed";
} & Readonly<A>;
export declare class CertificateIssuanceFailed extends CertificateIssuanceFailed_base<{
    certificateId: number;
    code?: string;
    message: string;
}> {
}
export declare const CertificateProvider: () => import("effect/Layer").Layer<Provider.Provider<Certificate>, never, import("../Stack.ts").Stack | import("../Stage.ts").Stage | Services.actions.HetznerOpContext>;
export {};
//# sourceMappingURL=Certificate.d.ts.map