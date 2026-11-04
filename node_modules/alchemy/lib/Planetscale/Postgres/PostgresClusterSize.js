import * as planetscale from "@distilled.cloud/planetscale";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import { pollUntil, waitForBranchReady } from "../Util.js";
/**
 * Converts a {@link PostgresClusterSize} into the SKU string expected by
 * the PlanetScale API.
 *
 * Hyphens are normalized to underscores so SKUs copied from PlanetScale
 * docs (`"PS-10"`, `"M1-10-AWS-ARM-D-METAL-10"`) match the API form.
 *
 * For NAS-backed clusters, the API expects a suffixed name like
 * `PS_<size>_<provider>_<arch>`. Short `PS_*` sizes are expanded using the
 * supplied region and arch.
 *
 * Metal-backed sizes (anything starting with `M`) are passed through after
 * hyphen normalization. The short `M_*` / `M-*` form is not a valid SKU on
 * its own — the API requires the full Metal SKU (e.g.
 * `M1_10_AWS_ARM_D_METAL_10`), which encodes the CPU series, provider,
 * arch, and storage size.
 *
 * Already-suffixed NAS sizes are also passed through unchanged.
 */
export function toPostgresClusterSku(input) {
    const size = input.size.replaceAll("-", "_");
    if (!size.startsWith("PS_") || size.match(/(AWS|GCP)/))
        return size;
    // Not all AWS regions start with "aws-", but all GCP regions start with "gcp-".
    const provider = input.region?.startsWith("gcp") ? "GCP" : "AWS";
    const arch = (input.arch ?? "x86").toUpperCase();
    return `${size}_${provider}_${arch}`;
}
/**
 * Schedule for polling branch change requests. Postgres cluster resizes
 * routinely take longer than the default 10-minute polling budget, so
 * give change requests a 60-minute budget (720 × 5s).
 */
const changeRequestSchedule = Schedule.max([
    Schedule.spaced("5 seconds"),
    Schedule.recurs(720),
]);
/**
 * Polls branch change requests until all visible changes are in a terminal
 * state (`completed` or `canceled`), or — if `changeId` is provided — until
 * that specific change reaches a terminal state.
 */
export const waitForPendingPostgresChanges = Effect.fn(function* (organization, database, branch, changeId) {
    yield* pollUntil(`changes for branch "${branch}"`, planetscale.listBranchChangeRequests({
        organization,
        database,
        branch,
        page: 1,
        per_page: 25,
    }), (page) => {
        const isTerminal = (state) => state === "completed" || state === "canceled";
        if (changeId) {
            const change = page.data.find((change) => change.id === changeId);
            return change ? isTerminal(change.state) : false;
        }
        return page.data.every((change) => isTerminal(change.state));
    }, changeRequestSchedule);
});
/**
 * Ensures a PostgreSQL production branch has the expected cluster size,
 * queuing the change via the change-request API if it doesn't.
 */
export const ensurePostgresProductionBranchClusterSize = Effect.fn(function* (organization, database, branch, expectedClusterSize) {
    // A freshly-forked branch can't accept (or complete) change requests
    // until it has finished provisioning — queueing a resize against it
    // just leaves the change pending until the poll budget runs out.
    const data = yield* waitForBranchReady(organization, database, branch);
    const sku = toPostgresClusterSku({
        size: expectedClusterSize,
        arch: data.cluster_architecture === "aarch64" ? "arm" : "x86",
        region: data.region.slug,
    });
    if (data.cluster_name === sku) {
        return;
    }
    yield* waitForPendingPostgresChanges(organization, database, branch);
    const change = yield* planetscale.updateBranchChangeRequest({
        organization,
        database,
        branch,
        cluster_size: sku,
    });
    yield* waitForPendingPostgresChanges(organization, database, branch, change.id);
});
//# sourceMappingURL=PostgresClusterSize.js.map