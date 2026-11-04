import type { Credentials } from "@distilled.cloud/cloudflare/Credentials";
import * as d1 from "@distilled.cloud/cloudflare/d1";
import * as Effect from "effect/Effect";
import type * as HttpClient from "effect/unstable/http/HttpClient";
export interface ExportD1DatabaseOptions {
    accountId: string;
    databaseId: string;
    dumpOptions?: {
        tables?: string[];
        noSchema?: boolean;
        noData?: boolean;
    };
}
export interface ExportD1DatabaseResult {
    filename: string;
    signedUrl: string;
}
/**
 * Initiates an export of a Cloudflare D1 database and returns a signed
 * download URL. Recursively polls with the bookmark until the export
 * completes or fails.
 */
export declare const exportDatabase: (options: ExportD1DatabaseOptions) => Effect.Effect<ExportD1DatabaseResult, d1.ExportDatabaseError, Credentials | HttpClient.HttpClient>;
//# sourceMappingURL=ExportDatabase.d.ts.map