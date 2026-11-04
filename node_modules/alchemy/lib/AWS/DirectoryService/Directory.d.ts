import * as ds from "@distilled.cloud/aws/directory-service";
import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
/** The kind of managed directory to launch. */
export type DirectoryFlavor = "SimpleAD" | "MicrosoftAD";
export interface DirectoryProps {
    /**
     * Which managed directory to launch — a Samba-based `"SimpleAD"` or an
     * actual `"MicrosoftAD"` (AWS Managed Microsoft AD). Changing the flavor
     * replaces the directory.
     * @default "SimpleAD"
     */
    type?: DirectoryFlavor;
    /**
     * Fully qualified domain name of the directory, e.g. `corp.example.com`.
     * The domain does not need to be publicly resolvable. Changing the name
     * replaces the directory.
     */
    name: string;
    /**
     * NetBIOS short name of the directory, e.g. `CORP`. Changing the short
     * name replaces the directory.
     * @default the first label of `name`
     */
    shortName?: string;
    /**
     * Password for the directory administrator account (`Administrator` for
     * Simple AD, `Admin` for Microsoft AD). There is no API to change it after
     * creation, so changing the password replaces the directory.
     */
    password: Redacted.Redacted<string>;
    /**
     * Human-readable description of the directory. There is no update API, so
     * changing the description replaces the directory.
     */
    description?: string;
    /**
     * Size of a Simple AD directory — `"Small"` (up to ~500 users) or
     * `"Large"` (up to ~5000 users). Ignored for Microsoft AD. Changing the
     * size replaces the directory.
     * @default "Small"
     */
    size?: ds.DirectorySize;
    /**
     * Edition of a Microsoft AD directory — `"Standard"` or `"Enterprise"`.
     * Ignored for Simple AD. Changing the edition replaces the directory.
     * @default "Standard"
     */
    edition?: ds.DirectoryEdition;
    /**
     * VPC the directory's domain controllers are placed into. Changing the
     * VPC replaces the directory.
     */
    vpcId: string;
    /**
     * Exactly two subnets in DIFFERENT Availability Zones of `vpcId` — one
     * domain controller is launched into each. Changing the subnets replaces
     * the directory.
     */
    subnetIds: string[];
    /**
     * User-defined tags for the directory.
     */
    tags?: Record<string, string>;
}
export interface Directory extends Resource<"AWS.DirectoryService.Directory", DirectoryProps, {
    /** The ID of the directory, e.g. `d-1234567890`. */
    directoryId: string;
    /** The ARN of the directory, e.g. `arn:aws:ds:us-east-1:123456789012:directory/d-1234567890`. */
    directoryArn: string;
    /** The fully qualified name of the directory. */
    directoryName: string;
    /** The directory type, e.g. `SimpleAD` or `MicrosoftAD`. */
    type: string;
    /** The current lifecycle stage of the directory, e.g. `Active`. */
    stage: string;
    /** The size of a Simple AD directory (`Small` or `Large`). */
    size: string | undefined;
    /** The edition of a Microsoft AD directory (`Standard` or `Enterprise`). */
    edition: string | undefined;
    /** The directory alias used for the access URL. */
    alias: string | undefined;
    /** The access URL of the directory, e.g. `<alias>.awsapps.com`. */
    accessUrl: string | undefined;
    /** The IP addresses of the directory's DNS servers. */
    dnsIpAddrs: string[];
    /** The security group created for the directory's controllers. */
    securityGroupId: string | undefined;
    /** The VPC the directory is deployed into. */
    vpcId: string | undefined;
    /** The subnets hosting the directory's domain controllers. */
    subnetIds: string[];
    /** The Availability Zones the directory spans. */
    availabilityZones: string[];
    /** The tags attached to the directory. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An AWS Directory Service managed directory — either Simple AD (Samba) or
 * AWS Managed Microsoft AD.
 *
 * Directories are VPC-only and require two subnets in different Availability
 * Zones. Provisioning is SLOW: Simple AD takes roughly 10 minutes and
 * Microsoft AD 20-40 minutes, and directories bill hourly while they exist.
 * Destroy directories you are not using.
 * ### Creating a Directory
 * **Example:** Simple AD Directory
 * ```typescript
 * const directory = yield* Directory("Corp", {
 *   name: "corp.example.com",
 *   password: Redacted.make("SuperSecret123!"),
 *   size: "Small",
 *   vpcId: vpc.vpcId,
 *   subnetIds: [subnetA.subnetId, subnetB.subnetId],
 * });
 * ```
 *
 * **Example:** Managed Microsoft AD Directory
 * ```typescript
 * const directory = yield* Directory("Corp", {
 *   type: "MicrosoftAD",
 *   name: "corp.example.com",
 *   shortName: "CORP",
 *   password: Redacted.make("SuperSecret123!"),
 *   edition: "Standard",
 *   vpcId: vpc.vpcId,
 *   subnetIds: [subnetA.subnetId, subnetB.subnetId],
 * });
 * ```
 *
 * ### Using the Directory
 * **Example:** Read the DNS Addresses
 * ```typescript
 * const directory = yield* Directory("Corp", { ... });
 * // the directory-provided DNS servers, one per Availability Zone
 * const dns = directory.dnsIpAddrs;
 * ```
 *
 * @resource
 */
export declare const Directory: import("../../Resource.ts").ResourceClass<Directory>;
export declare const DirectoryProvider: () => import("effect/Layer").Layer<Provider.Provider<Directory>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Directory.d.ts.map