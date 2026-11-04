import * as agw2 from "@distilled.cloud/aws/apigatewayv2";
import * as Effect from "effect/Effect";
import { deepEqual, isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags } from "../../Tags.js";
import { AWSEnvironment } from "../Environment.js";
import { collectAllPages, retryOnTooManyRequests, syncTags, tagRecord, vpcLinkArn, } from "./common.js";
/**
 * An API Gateway v2 VPC link — lets an HTTP API reach private resources
 * (ALB/NLB listeners, Cloud Map services) inside a VPC.
 *
 * Unlike the v1 VPC link (NLB-only, ~10 min provisioning), the v2 link is
 * subnet/security-group based and provisions in ~1–2 minutes.
 * ### Private integrations
 * **Example:** VPC link + private integration
 * ```typescript
 * const link = yield* ApiGatewayV2.VpcLink("Link", {
 *   subnetIds: [subnetA.subnetId, subnetB.subnetId],
 *   securityGroupIds: [securityGroup.securityGroupId],
 * });
 *
 * yield* ApiGatewayV2.Integration("Private", {
 *   api,
 *   integrationType: "HTTP_PROXY",
 *   integrationUri: listener.listenerArn,
 *   integrationMethod: "ANY",
 *   connectionType: "VPC_LINK",
 *   connectionId: link.vpcLinkId,
 *   payloadFormatVersion: "1.0",
 * });
 * ```
 *
 * @resource
 */
export const VpcLink = Resource("AWS.ApiGatewayV2.VpcLink");
const snapshotFromVpcLink = (link) => ({
    vpcLinkId: link.VpcLinkId,
    name: link.Name ?? "",
    subnetIds: [...(link.SubnetIds ?? [])],
    securityGroupIds: [...(link.SecurityGroupIds ?? [])],
    status: link.VpcLinkStatus,
    tags: tagRecord(link.Tags),
});
export const VpcLinkProvider = () => Provider.effect(VpcLink, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return (props.name ?? (yield* createPhysicalName({ id, maxLength: 128 })));
    });
    const getVpcLinkSafe = (vpcLinkId) => agw2
        .getVpcLink({ VpcLinkId: vpcLinkId })
        .pipe(Effect.catchTag("NotFoundException", () => Effect.succeed(undefined)));
    return VpcLink.Provider.of({
        stables: ["vpcLinkId"],
        list: () => Effect.gen(function* () {
            const items = yield* collectAllPages((NextToken) => agw2.getVpcLinks({ NextToken }));
            return items
                .filter((link) => link.VpcLinkId != null)
                .map((link) => snapshotFromVpcLink(link));
        }),
        read: Effect.fn(function* ({ output }) {
            if (!output?.vpcLinkId)
                return undefined;
            const link = yield* getVpcLinkSafe(output.vpcLinkId);
            if (!link?.VpcLinkId)
                return undefined;
            return snapshotFromVpcLink(link);
        }),
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return undefined;
            // Subnets and security groups are immutable on a v2 VPC link.
            if (!deepEqual([...news.subnetIds].sort(), [...olds.subnetIds].sort()) ||
                !deepEqual([...(news.securityGroupIds ?? [])].sort(), [...(olds.securityGroupIds ?? [])].sort())) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const { region } = yield* AWSEnvironment.current;
            const name = yield* createName(id, news);
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            // 1. OBSERVE
            let observed = output?.vpcLinkId
                ? yield* getVpcLinkSafe(output.vpcLinkId)
                : undefined;
            // 2. ENSURE
            if (!observed?.VpcLinkId) {
                observed = yield* retryOnTooManyRequests(agw2.createVpcLink({
                    Name: name,
                    SubnetIds: news.subnetIds,
                    SecurityGroupIds: news.securityGroupIds,
                    Tags: desiredTags,
                }));
                yield* session.note(`Created VPC link ${observed.VpcLinkId}`);
            }
            const snapshot = snapshotFromVpcLink(observed);
            // 3. SYNC — only the name is mutable.
            if (snapshot.name !== name) {
                yield* retryOnTooManyRequests(agw2.updateVpcLink({
                    VpcLinkId: snapshot.vpcLinkId,
                    Name: name,
                }));
            }
            // 3b. SYNC TAGS — diff against OBSERVED cloud tags.
            if (!deepEqual(snapshot.tags, desiredTags)) {
                yield* syncTags({
                    resourceArn: vpcLinkArn(region, snapshot.vpcLinkId),
                    oldTags: snapshot.tags,
                    newTags: desiredTags,
                });
            }
            // 4. RETURN fresh state. Provisioning is asynchronous (~1–2 min);
            //    the `status` attribute surfaces it rather than blocking the
            //    deploy on AVAILABLE.
            const final = yield* agw2.getVpcLink({
                VpcLinkId: snapshot.vpcLinkId,
            });
            yield* session.note(`Reconciled VPC link ${snapshot.vpcLinkId}`);
            return snapshotFromVpcLink(final);
        }),
        delete: Effect.fn(function* ({ output, session }) {
            yield* retryOnTooManyRequests(agw2
                .deleteVpcLink({ VpcLinkId: output.vpcLinkId })
                .pipe(Effect.catchTag("NotFoundException", () => Effect.void)));
            yield* session.note(`Deleted VPC link ${output.vpcLinkId}`);
        }),
    });
}));
//# sourceMappingURL=VpcLink.js.map