import * as flagship from "@distilled.cloud/cloudflare/flagship";
import * as Effect from "effect/Effect";
import { FlagshipError, } from "./ReadFlags.js";
/**
 * The HTTP evaluate endpoint only supports a single `targetingKey` query
 * param, not the full flat evaluation context the Worker binding accepts.
 */
const targetingKeyOf = (context) => {
    const value = context?.["targetingKey"];
    return value === undefined ? undefined : String(value);
};
/**
 * Build a {@link ReadFlagsClient} over the Flagship HTTP evaluate endpoint
 * (`GET .../flagship/apps/{appId}/evaluate`).
 *
 * `appId` is an Effect so the resolution stays deferred to each call — inside
 * an Action it resolves through the apply-time RuntimeContext. Mirrors the
 * Worker binding's fall-back-to-default semantics: evaluation never fails the
 * effect — an HTTP error or a value whose type does not match the requested
 * method resolves to `defaultValue` instead. The `raw` runtime binding has no
 * HTTP equivalent and dies if used.
 */
export const makeHttpFlagshipClient = (auth, appId) => {
    const evaluate = (flagKey, context) => appId.pipe(Effect.flatMap((id) => auth.authorize(flagship.getAppEvaluate({
        accountId: auth.accountId,
        appId: id,
        flagKey,
        targetingKey: targetingKeyOf(context),
    }))));
    const details = (flagKey, defaultValue, match, context) => evaluate(flagKey, context).pipe(Effect.map((r) => match(r.value)
        ? { flagKey, value: r.value, variant: r.variant, reason: r.reason }
        : {
            flagKey,
            value: defaultValue,
            variant: r.variant,
            reason: r.reason,
            errorCode: "TYPE_MISMATCH",
        }), Effect.catch((error) => Effect.succeed({
        flagKey,
        value: defaultValue,
        reason: "ERROR",
        errorCode: error._tag,
    })));
    const value = (flagKey, defaultValue, match, context) => evaluate(flagKey, context).pipe(Effect.map((r) => (match(r.value) ? r.value : defaultValue)), Effect.catch(() => Effect.succeed(defaultValue)));
    const isBoolean = (v) => typeof v === "boolean";
    const isString = (v) => typeof v === "string";
    const isNumber = (v) => typeof v === "number";
    const isObjectLike = (v) => v !== null && typeof v === "object";
    return {
        // The raw runtime binding is a workerd object with no HTTP surface.
        raw: Effect.die(new FlagshipError({
            message: "the raw Flagship runtime binding is unavailable over HTTP; use ReadFlagsBinding inside a Worker",
            cause: undefined,
        })),
        get: (flagKey, defaultValue, context) => evaluate(flagKey, context).pipe(Effect.map((r) => r.value ?? defaultValue), Effect.catch(() => Effect.succeed(defaultValue))),
        getBooleanValue: (flagKey, defaultValue, context) => value(flagKey, defaultValue, isBoolean, context),
        getStringValue: (flagKey, defaultValue, context) => value(flagKey, defaultValue, isString, context),
        getNumberValue: (flagKey, defaultValue, context) => value(flagKey, defaultValue, isNumber, context),
        getObjectValue: (flagKey, defaultValue, context) => evaluate(flagKey, context).pipe(Effect.map((r) => isObjectLike(r.value)
            ? r.value
            : defaultValue), Effect.catch(() => Effect.succeed(defaultValue))),
        getBooleanDetails: (flagKey, defaultValue, context) => details(flagKey, defaultValue, isBoolean, context),
        getStringDetails: (flagKey, defaultValue, context) => details(flagKey, defaultValue, isString, context),
        getNumberDetails: (flagKey, defaultValue, context) => details(flagKey, defaultValue, isNumber, context),
        getObjectDetails: (flagKey, defaultValue, context) => evaluate(flagKey, context).pipe(Effect.map((r) => isObjectLike(r.value)
            ? {
                flagKey,
                value: r.value,
                variant: r.variant,
                reason: r.reason,
            }
            : {
                flagKey,
                value: defaultValue,
                variant: r.variant,
                reason: r.reason,
                errorCode: "TYPE_MISMATCH",
            }), Effect.catch((error) => Effect.succeed({
            flagKey,
            value: defaultValue,
            reason: "ERROR",
            errorCode: error._tag,
        }))),
    };
};
//# sourceMappingURL=ReadFlagsHttpClient.js.map