import * as sdb from "@distilled.cloud/aws/simpledb";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { AWSEnvironment } from "../Environment.js";
/**
 * An Amazon SimpleDB domain — the container for SimpleDB items and
 * attributes, analogous to a table.
 *
 * SimpleDB is a legacy service (closed to accounts that never used it and
 * slated for migration via the SimpleDBv2 export API), but domains remain
 * fully manageable on grandfathered accounts. A domain has no mutable
 * configuration: the name is its identity, so any name change replaces the
 * domain. SimpleDB has no tagging API, so Alchemy cannot brand domains for
 * ownership detection.
 * ### Creating Domains
 * **Example:** Basic Domain
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const domain = yield* AWS.SimpleDB.Domain("MyDomain", {});
 * ```
 *
 * **Example:** Named Domain
 * ```typescript
 * const domain = yield* AWS.SimpleDB.Domain("MyDomain", {
 *   domainName: "my-application-data",
 * });
 * ```
 *
 * @resource
 */
export const Domain = Resource("AWS.SimpleDB.Domain");
/**
 * CreateDomain is eventually consistent — DomainMetadata directly after a
 * create can briefly report NoSuchDomain. Explicitly typed so the
 * conditional `Retry.Return` type does not leak into declaration emit.
 */
const retryWhileNoSuchDomain = (self) => Effect.retry(self, {
    while: (e) => e._tag === "NoSuchDomain",
    schedule: Schedule.max([Schedule.fixed("2 seconds"), Schedule.recurs(10)]),
});
export const DomainProvider = () => Provider.effect(Domain, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return (props.domainName ??
            (yield* createPhysicalName({ id, maxLength: 255 })));
    });
    const domainArn = (region, accountId, name) => `arn:aws:sdb:${region}:${accountId}:domain/${name}`;
    const observeDomain = Effect.fn(function* (name) {
        return yield* sdb
            .domainMetadata({ DomainName: name })
            .pipe(Effect.catchTag("NoSuchDomain", () => Effect.succeed(undefined)));
    });
    return Domain.Provider.of({
        stables: ["domainName", "domainArn"],
        list: () => Effect.gen(function* () {
            const { accountId, region } = yield* AWSEnvironment.current;
            const names = yield* sdb.listDomains
                .items({})
                .pipe(Stream.runCollect);
            return Array.from(names).map((name) => ({
                domainName: name,
                domainArn: domainArn(region, accountId, name),
            }));
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const { accountId, region } = yield* AWSEnvironment.current;
            const name = output?.domainName ?? (yield* createName(id, olds ?? {}));
            const metadata = yield* observeDomain(name);
            if (metadata === undefined) {
                return undefined;
            }
            // SimpleDB has no tagging API, so ownership cannot be verified —
            // an existing domain with the derived name is treated as ours.
            return {
                domainName: name,
                domainArn: domainArn(region, accountId, name),
            };
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            const oldName = yield* createName(id, olds ?? {});
            const newName = yield* createName(id, news);
            if (oldName !== newName) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const { accountId, region } = yield* AWSEnvironment.current;
            const name = output?.domainName ?? (yield* createName(id, news));
            // 1. OBSERVE — cloud state is authoritative
            const metadata = yield* observeDomain(name);
            // 2. ENSURE — CreateDomain is idempotent (creating an existing
            //    domain succeeds); wait until the domain is visible.
            if (metadata === undefined) {
                yield* sdb.createDomain({ DomainName: name });
                yield* retryWhileNoSuchDomain(sdb.domainMetadata({ DomainName: name }));
            }
            // 3. SYNC — a domain has no mutable configuration and no tags.
            yield* session.note(name);
            return {
                domainName: name,
                domainArn: domainArn(region, accountId, name),
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            // DeleteDomain is idempotent — deleting a missing domain succeeds.
            yield* sdb.deleteDomain({ DomainName: output.domainName });
        }),
    });
}));
//# sourceMappingURL=Domain.js.map