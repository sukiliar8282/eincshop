import * as devopsguru from "@distilled.cloud/aws/devops-guru";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import { Unowned } from "../../AdoptPolicy.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
/**
 * The DevOps Guru service integration — the account/region singleton that
 * controls how DevOps Guru integrates with other AWS services: creating a
 * Systems Manager OpsItem for each insight, analyzing CloudWatch log groups
 * for anomalies, and encrypting DevOps Guru data with a customer-managed
 * KMS key.
 *
 * An account has exactly one integration configuration, so this resource is
 * a capture-and-restore singleton: adopting a non-default configuration that
 * Alchemy did not create requires `--adopt`. Destroying the resource
 * restores the account defaults (everything disabled, AWS-owned key).
 *
 * ### Configuring the Integration
 * **Example:** Enable Log Anomaly Detection
 * ```typescript
 * const integration = yield* DevOpsGuru.ServiceIntegration("Integration", {
 *   logsAnomalyDetection: true,
 * });
 * ```
 *
 * **Example:** File an OpsItem for Every Insight
 * ```typescript
 * const integration = yield* DevOpsGuru.ServiceIntegration("Integration", {
 *   opsCenter: true,
 *   logsAnomalyDetection: true,
 * });
 * ```
 *
 * **Example:** Encrypt with a Customer-Managed Key
 * ```typescript
 * const integration = yield* DevOpsGuru.ServiceIntegration("Integration", {
 *   kmsKeyId: key.keyId,
 * });
 * ```
 *
 * @resource
 */
export const ServiceIntegration = Resource("AWS.DevOpsGuru.ServiceIntegration");
const isDefault = (observed) => !observed.opsCenter &&
    !observed.logsAnomalyDetection &&
    observed.encryptionType === "AWS_OWNED_KMS_KEY";
/**
 * Concurrent `UpdateServiceIntegration` calls conflict server-side — retry
 * the typed conflict tag on a short bounded schedule.
 *
 * Explicitly typed: inlining `Effect.retry` with options in provider
 * lifecycle code can widen the provider layer to `unknown` in declaration
 * emit.
 *
 * @internal
 */
const retryUpdateConflict = (self) => Effect.retry(self, {
    while: (e) => e._tag === "ConflictException",
    schedule: Schedule.max([Schedule.fixed("2 seconds"), Schedule.recurs(8)]),
});
export const ServiceIntegrationProvider = () => Provider.effect(ServiceIntegration, Effect.gen(function* () {
    // Observe the live account configuration. Absent sections and absent
    // opt-in statuses mean "account default" (disabled / AWS-owned key).
    const observe = Effect.gen(function* () {
        const { ServiceIntegration: config } = yield* devopsguru.describeServiceIntegration({});
        const kms = config?.KMSServerSideEncryption;
        const encryptionType = kms?.Type ?? "AWS_OWNED_KMS_KEY";
        return {
            opsCenter: config?.OpsCenter?.OptInStatus === "ENABLED",
            logsAnomalyDetection: config?.LogsAnomalyDetection?.OptInStatus === "ENABLED",
            encryptionType,
            kmsKeyId: encryptionType === "CUSTOMER_MANAGED_KEY"
                ? kms?.KMSKeyId
                : undefined,
        };
    });
    const update = Effect.fn(function* (config) {
        yield* retryUpdateConflict(devopsguru.updateServiceIntegration({ ServiceIntegration: config }));
    });
    // Converge the live configuration to the desired shape, one section
    // per update call so a partial failure leaves the others converged.
    const converge = Effect.fn(function* (observed, desired) {
        const wantOpsCenter = desired.opsCenter ?? false;
        if (observed.opsCenter !== wantOpsCenter) {
            yield* update({
                OpsCenter: {
                    OptInStatus: wantOpsCenter ? "ENABLED" : "DISABLED",
                },
            });
        }
        const wantLogs = desired.logsAnomalyDetection ?? false;
        if (observed.logsAnomalyDetection !== wantLogs) {
            yield* update({
                LogsAnomalyDetection: {
                    OptInStatus: wantLogs ? "ENABLED" : "DISABLED",
                },
            });
        }
        if (desired.kmsKeyId !== undefined) {
            if (observed.encryptionType !== "CUSTOMER_MANAGED_KEY" ||
                observed.kmsKeyId !== desired.kmsKeyId) {
                yield* update({
                    KMSServerSideEncryption: {
                        Type: "CUSTOMER_MANAGED_KEY",
                        KMSKeyId: desired.kmsKeyId,
                        OptInStatus: "ENABLED",
                    },
                });
            }
        }
        else if (observed.encryptionType === "CUSTOMER_MANAGED_KEY") {
            yield* update({
                KMSServerSideEncryption: {
                    Type: "AWS_OWNED_KMS_KEY",
                    OptInStatus: "ENABLED",
                },
            });
        }
    });
    return {
        // Account/region singleton — surfaced only when non-default.
        list: () => observe.pipe(Effect.map((observed) => (isDefault(observed) ? [] : [observed]))),
        read: Effect.fn(function* ({ output }) {
            const observed = yield* observe;
            if (isDefault(observed)) {
                return undefined;
            }
            // The integration can't carry ownership tags — a non-default
            // configuration we have no record of belongs to someone else
            // until explicitly adopted.
            return output !== undefined ? observed : Unowned(observed);
        }),
        reconcile: Effect.fn(function* ({ news, session }) {
            // 1. OBSERVE — the live account configuration is authoritative.
            const observed = yield* observe;
            // 2. SYNC — apply only the changed sections.
            yield* converge(observed, news);
            // 3. RETURN fresh attributes.
            const final = yield* observe;
            yield* session.note(`opsCenter: ${final.opsCenter}, logsAnomalyDetection: ${final.logsAnomalyDetection}, encryption: ${final.encryptionType}`);
            return final;
        }),
        // "Deleting" the singleton restores the account defaults.
        delete: Effect.fn(function* () {
            const observed = yield* observe;
            yield* converge(observed, {});
        }),
    };
}));
//# sourceMappingURL=ServiceIntegration.js.map