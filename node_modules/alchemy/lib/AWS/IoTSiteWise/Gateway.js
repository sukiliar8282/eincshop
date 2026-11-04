import * as sitewise from "@distilled.cloud/aws/iotsitewise";
import * as Effect from "effect/Effect";
import * as EffectStream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { fetchSiteWiseTags, matchesDesired, syncSiteWiseTags, } from "./internal.js";
/**
 * An AWS IoT SiteWise gateway — the ingestion point that connects
 * on-premises industrial data sources (e.g. OPC UA servers) to IoT
 * SiteWise, hosted on an IoT Greengrass V2 core device or a Siemens
 * Industrial Edge device.
 *
 * The cloud-side gateway resource registers immediately; the edge
 * software syncs to it asynchronously once the referenced core device is
 * online (the device does not need to exist to create the gateway).
 *
 * ### Creating Gateways
 * **Example:** Greengrass V2 Gateway
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const gateway = yield* AWS.IoTSiteWise.Gateway("FactoryGateway", {
 *   gatewayPlatform: {
 *     greengrassV2: { coreDeviceThingName: "FactoryCoreDevice" },
 *   },
 * });
 * ```
 *
 * @resource
 */
export const Gateway = Resource("AWS.IoTSiteWise.Gateway");
const createGatewayName = (id, props) => props.gatewayName
    ? Effect.succeed(props.gatewayName)
    : createPhysicalName({ id, maxLength: 256 });
const readGatewayById = Effect.fn(function* (gatewayId) {
    const described = yield* sitewise
        .describeGateway({ gatewayId })
        .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    if (!described)
        return undefined;
    const state = {
        described,
        attrs: {
            gatewayId: described.gatewayId,
            gatewayArn: described.gatewayArn,
            gatewayName: described.gatewayName,
            gatewayPlatform: described.gatewayPlatform,
            gatewayVersion: described.gatewayVersion,
            tags: yield* fetchSiteWiseTags(described.gatewayArn),
        },
    };
    return state;
});
const findGatewayByName = Effect.fn(function* (name) {
    const summaries = yield* sitewise.listGateways.pages({}).pipe(EffectStream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => page.gatewaySummaries)));
    const match = summaries.find((summary) => summary.gatewayName === name);
    if (!match)
        return undefined;
    return yield* readGatewayById(match.gatewayId);
});
export const GatewayProvider = () => Provider.effect(Gateway, Effect.gen(function* () {
    return {
        stables: ["gatewayId", "gatewayArn"],
        list: () => Effect.gen(function* () {
            const summaries = yield* sitewise.listGateways.pages({}).pipe(EffectStream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => page.gatewaySummaries)));
            const hydrated = yield* Effect.forEach(summaries.map((summary) => summary.gatewayId), (gatewayId) => readGatewayById(gatewayId), { concurrency: 5 });
            return hydrated.flatMap((state) => state === undefined ? [] : [state.attrs]);
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const state = output?.gatewayId
                ? yield* readGatewayById(output.gatewayId)
                : yield* findGatewayByName(yield* createGatewayName(id, olds ?? {}));
            if (!state)
                return undefined;
            return (yield* hasAlchemyTags(id, state.attrs.tags))
                ? state.attrs
                : Unowned(state.attrs);
        }),
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return;
            if (olds === undefined)
                return;
            // Platform and version are fixed at creation; only the name is
            // mutable via UpdateGateway.
            if (!matchesDesired(news.gatewayPlatform, olds.gatewayPlatform) ||
                !matchesDesired(olds.gatewayPlatform, news.gatewayPlatform) ||
                (news.gatewayVersion !== undefined &&
                    news.gatewayVersion !== olds.gatewayVersion)) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            if (!news) {
                return yield* Effect.fail(new Error("IoT SiteWise Gateway requires props"));
            }
            const name = yield* createGatewayName(id, news);
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            // Observe — prefer the cached id; fall back to a name lookup.
            let state = output?.gatewayId
                ? yield* readGatewayById(output.gatewayId)
                : yield* findGatewayByName(name);
            // Ensure — create if missing (gateway creation is synchronous).
            if (state === undefined) {
                const created = yield* sitewise
                    .createGateway({
                    gatewayName: name,
                    gatewayPlatform: news.gatewayPlatform,
                    gatewayVersion: news.gatewayVersion,
                    tags: desiredTags,
                })
                    .pipe(
                // A concurrent create of the same name is a race — adopt it.
                Effect.catchTag("ResourceAlreadyExistsException", () => Effect.gen(function* () {
                    const existing = yield* findGatewayByName(name);
                    if (existing === undefined) {
                        return yield* Effect.fail(new Error(`gateway '${name}' already exists but was not found by name`));
                    }
                    return {
                        gatewayId: existing.attrs.gatewayId,
                        gatewayArn: existing.attrs.gatewayArn,
                    };
                })));
                yield* session.note(`Created gateway ${name} (${created.gatewayId})`);
                state = yield* readGatewayById(created.gatewayId);
                if (state === undefined) {
                    return yield* Effect.fail(new Error(`failed to read created gateway ${name}`));
                }
            }
            // Sync — only the name is mutable.
            if (name !== state.described.gatewayName) {
                yield* sitewise.updateGateway({
                    gatewayId: state.attrs.gatewayId,
                    gatewayName: name,
                });
                yield* session.note(`Renamed gateway to ${name}`);
            }
            // Sync tags — diff against observed cloud tags.
            yield* syncSiteWiseTags(state.attrs.gatewayArn, state.attrs.tags, desiredTags);
            yield* session.note(state.attrs.gatewayArn);
            const final = yield* readGatewayById(state.attrs.gatewayId);
            if (!final) {
                return yield* Effect.fail(new Error(`failed to read reconciled gateway ${name}`));
            }
            return final.attrs;
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* sitewise
                .deleteGateway({ gatewayId: output.gatewayId })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    };
}));
//# sourceMappingURL=Gateway.js.map