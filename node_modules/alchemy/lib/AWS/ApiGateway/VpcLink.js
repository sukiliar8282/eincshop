import * as ag from "@distilled.cloud/aws/api-gateway";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { deepEqual, isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, tagRecord } from "../../Tags.js";
import { AWSEnvironment } from "../Environment.js";
import { syncTags, vpcLinkArn } from "./common.js";
/**
 * VPC link for private integrations (`connectionType: "VPC_LINK"` on a method integration).
 *
 * ### Private integrations
 * **Example:** Create a VPC link
 * ```typescript
 * const link = yield* ApiGateway.VpcLink("NlbLink", {
 *   description: "Link to internal NLB",
 *   targetArns: [nlb.loadBalancerArn],
 * });
 *
 * yield* ApiGateway.Method("PrivateGet", {
 *   restApiId: api.restApiId,
 *   resourceId: resource.resourceId,
 *   httpMethod: "GET",
 *   integration: {
 *     type: "HTTP_PROXY",
 *     integrationHttpMethod: "GET",
 *     uri: "https://api.internal.example.com/hello",
 *     connectionType: "VPC_LINK",
 *     connectionId: link.vpcLinkId,
 *   },
 * });
 * ```
 */
const VpcLinkResource = Resource("AWS.ApiGateway.VpcLink");
export { VpcLinkResource as VpcLink };
const generatedName = (id, props) => props.name
    ? Effect.succeed(props.name)
    : createPhysicalName({
        id,
        maxLength: 128,
    });
const snapshotFromVpcLink = (v, tags) => ({
    vpcLinkId: v.id,
    name: v.name,
    description: v.description,
    targetArns: v.targetArns,
    status: v.status,
    statusMessage: v.statusMessage,
    tags,
});
export const VpcLinkProvider = () => Provider.effect(VpcLinkResource, Effect.gen(function* () {
    return {
        stables: ["vpcLinkId"],
        diff: Effect.fn(function* ({ news: newsIn, olds }) {
            if (!isResolved(newsIn))
                return;
            const news = newsIn;
            if (!deepEqual(news.targetArns, olds.targetArns)) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ output }) {
            if (!output?.vpcLinkId)
                return undefined;
            const v = yield* ag
                .getVpcLink({ vpcLinkId: output.vpcLinkId })
                .pipe(Effect.catchTag("NotFoundException", () => Effect.succeed(undefined)));
            if (!v?.id)
                return undefined;
            return snapshotFromVpcLink(v, tagRecord(v.tags));
        }),
        list: () => ag.getVpcLinks.pages({ limit: 500 }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.items ?? [])
            .filter((v) => !!v.id)
            .map((v) => snapshotFromVpcLink(v, tagRecord(v.tags)))))),
        reconcile: Effect.fn(function* ({ id, news: newsIn, output, session }) {
            if (!isResolved(newsIn)) {
                return yield* Effect.die("VpcLink props were not resolved");
            }
            const news = newsIn;
            const name = yield* generatedName(id, news);
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            const { region } = yield* AWSEnvironment.current;
            // Observe — fetch the live VPC link if we have a cached id.
            // We never trust `output.description`/etc. for diffing; the
            // observed cloud state drives every sync below.
            let observed = output?.vpcLinkId
                ? yield* ag
                    .getVpcLink({ vpcLinkId: output.vpcLinkId })
                    .pipe(Effect.catchTag("NotFoundException", () => Effect.succeed(undefined)))
                : undefined;
            // Ensure — create the VPC link if missing.
            if (!observed?.id) {
                const created = yield* ag.createVpcLink({
                    name,
                    description: news.description,
                    targetArns: news.targetArns,
                    tags: desiredTags,
                });
                if (!created.id) {
                    return yield* Effect.die("createVpcLink missing id");
                }
                yield* session.note(`Created VPC link ${created.id}`);
                observed = yield* ag.getVpcLink({ vpcLinkId: created.id });
            }
            const vpcLinkId = observed.id;
            // Sync mutable scalar fields — observed ↔ desired patch list.
            const patches = [];
            if (news.description !== observed.description) {
                patches.push({
                    op: "replace",
                    path: "/description",
                    value: news.description ?? "",
                });
            }
            if (news.name !== undefined && news.name !== observed.name) {
                patches.push({
                    op: "replace",
                    path: "/name",
                    value: news.name,
                });
            }
            if (patches.length > 0) {
                yield* ag.updateVpcLink({
                    vpcLinkId,
                    patchOperations: patches,
                });
            }
            // Sync tags — observed ↔ desired so adoption converges without
            // fighting the existing tag set.
            const observedTags = tagRecord(observed.tags);
            if (!deepEqual(observedTags, desiredTags)) {
                yield* syncTags({
                    resourceArn: vpcLinkArn(region, vpcLinkId),
                    oldTags: observedTags,
                    newTags: desiredTags,
                });
            }
            yield* session.note(`Reconciled VPC link ${vpcLinkId}`);
            const final = yield* ag.getVpcLink({ vpcLinkId });
            return snapshotFromVpcLink(final, tagRecord(final.tags));
        }),
        delete: Effect.fn(function* ({ output, session }) {
            yield* ag.deleteVpcLink({ vpcLinkId: output.vpcLinkId }).pipe(Effect.retry({
                while: (e) => e._tag === "ConflictException",
                schedule: Schedule.spaced("1 second"),
                times: 8,
            }), Effect.catchTag("NotFoundException", () => Effect.void));
            yield* session.note(`Deleted VPC link ${output.vpcLinkId}`);
        }),
    };
}));
//# sourceMappingURL=VpcLink.js.map