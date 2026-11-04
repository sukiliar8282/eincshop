import * as d1 from "@distilled.cloud/cloudflare/d1";
import * as Effect from "effect/Effect";
/**
 * Initiates an export of a Cloudflare D1 database and returns a signed
 * download URL. Recursively polls with the bookmark until the export
 * completes or fails.
 */
export const exportDatabase = (options) => Effect.gen(function* () {
    const exportDb = yield* d1.exportDatabase;
    const poll = (currentBookmark) => Effect.gen(function* () {
        const data = yield* exportDb({
            accountId: options.accountId,
            databaseId: options.databaseId,
            outputFormat: "polling",
            currentBookmark,
            dumpOptions: options.dumpOptions,
        });
        if (data.status === "complete" && data.result) {
            if (!data.result.filename || !data.result.signedUrl) {
                return yield* Effect.die("D1 export completed but missing filename/signedUrl");
            }
            return {
                filename: data.result.filename,
                signedUrl: data.result.signedUrl,
            };
        }
        if (data.status === "error") {
            return yield* Effect.die(data.error ?? "Error during D1 export");
        }
        return yield* poll(data.atBookmark ?? undefined);
    });
    return yield* poll();
});
//# sourceMappingURL=ExportDatabase.js.map