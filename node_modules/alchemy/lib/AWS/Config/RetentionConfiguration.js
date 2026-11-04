import * as config from "@distilled.cloud/aws/config-service";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { toWireDays } from "../../Util/Duration.js";
/**
 * The AWS Config retention configuration that controls how long AWS Config
 * retains your recorded configuration items.
 *
 * AWS allows only **one** retention configuration per account per region and
 * always names it `default` — treat this resource as an account-region
 * singleton.
 * ### Configuring Retention
 * **Example:** Retain configuration items for one year
 * ```typescript
 * import * as Config from "alchemy/AWS/Config";
 *
 * const retention = yield* Config.RetentionConfiguration("Retention", {
 *   retentionPeriod: "365 days",
 * });
 * ```
 *
 * **Example:** Minimum retention
 * ```typescript
 * const retention = yield* Config.RetentionConfiguration("Retention", {
 *   retentionPeriod: "30 days",
 * });
 * ```
 *
 * @resource
 */
export const RetentionConfiguration = Resource("AWS.Config.RetentionConfiguration");
export const RetentionConfigurationProvider = () => Provider.effect(RetentionConfiguration, Effect.gen(function* () {
    // The API names the singleton object `default`; describe with no name
    // filter returns it (or nothing).
    const observeRetention = config.describeRetentionConfigurations({}).pipe(Effect.map((r) => (r.RetentionConfigurations ?? []).at(0)), Effect.catchTag("NoSuchRetentionConfigurationException", () => Effect.succeed(undefined)));
    const toAttrs = (retention) => ({
        retentionConfigurationName: retention.Name,
        retentionPeriodInDays: retention.RetentionPeriodInDays,
    });
    return RetentionConfiguration.Provider.of({
        stables: ["retentionConfigurationName"],
        list: () => config.describeRetentionConfigurations.items({}).pipe(Stream.runCollect, Effect.map((retentions) => Array.from(retentions).map(toAttrs))),
        // Retention configurations are not taggable and AWS fixes the name to
        // `default`, so there is no ownership marker — an existing retention
        // configuration is treated as ours (singleton adoption), matching the
        // DeliveryChannel convention.
        read: Effect.fn(function* () {
            const retention = yield* observeRetention;
            return retention === undefined ? undefined : toAttrs(retention);
        }),
        reconcile: Effect.fn(function* ({ news, session }) {
            const desiredDays = toWireDays(news.retentionPeriod);
            // 1. OBSERVE — cloud state is authoritative.
            const observed = yield* observeRetention;
            // 2+3. ENSURE + SYNC — PutRetentionConfiguration is a full upsert
            //    of the account-region singleton; skip the API on no-op.
            if (observed === undefined ||
                observed.RetentionPeriodInDays !== desiredDays) {
                yield* config.putRetentionConfiguration({
                    RetentionPeriodInDays: desiredDays,
                });
            }
            const name = observed?.Name ?? "default";
            yield* session.note(`${name} (${desiredDays} days)`);
            return {
                retentionConfigurationName: name,
                retentionPeriodInDays: desiredDays,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* config
                .deleteRetentionConfiguration({
                RetentionConfigurationName: output.retentionConfigurationName,
            })
                .pipe(Effect.catchTag("NoSuchRetentionConfigurationException", () => Effect.void));
        }),
    });
}));
//# sourceMappingURL=RetentionConfiguration.js.map