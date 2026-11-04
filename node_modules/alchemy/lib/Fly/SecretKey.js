import * as machines from "@distilled.cloud/fly-io/machines";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import { Unowned } from "../AdoptPolicy.js";
import { deepEqual, isResolved } from "../Diff.js";
import * as Provider from "../Provider.js";
import { Resource } from "../Resource.js";
import { App, listOwnedApps } from "./App.js";
import { createFlyVolumeName, matchesAlchemyPhysicalName, sanitizeFlyVolumeName, } from "./Metadata.js";
const resolveSecretKeyProps = (props) => Effect.gen(function* () {
    const resolved = Effect.isEffect(props) ? yield* props : props;
    if (globalThis.__ALCHEMY_RUNTIME__)
        return resolved;
    const app = Effect.isEffect(resolved.app)
        ? yield* resolved.app
        : resolved.app;
    return { ...resolved, app };
});
const SecretKeyResource = Resource("Fly.SecretKey");
/**
 * A Fly.SecretKey is an App KMS key, not an env secret. Generate a
 * random key or set raw material. Private bytes never appear in
 * attributes.
 *
 * Use it at runtime with {@link Encrypt}, {@link Decrypt}, {@link Sign},
 * and {@link Verify}. Generate, set, and delete stay on this resource.
 *
 * @see https://docs.machines.dev/secrets/Secretkeys_list
 *
 * ### Generate a key
 * Omit `value` and Fly generates a key via `generateSecretKey`. `type`
 * is Fly's key type (`nacl_sign`, `nacl_box`, `nacl_secretbox`,
 * `hs256`, `hs384`, `hs512`, `xaes256gcm`, `nacl_auth`, `es256`, …).
 *
 * **Example:** Signing key
 * ```typescript
 * export const Signing = Fly.SecretKey("Signing", {
 *   app: Site,
 *   type: "nacl_sign",
 * });
 * ```
 *
 * :::caution[Changing `app`, `name`, or `type` replaces the key]
 * The new key is created. The old one is deleted. Ciphertext from the
 * old key will not decrypt.
 * :::
 *
 * ### Set raw material
 * Pass `value` as bytes. The key is created or updated with
 * `setSecretKey`. Never persisted in state.
 *
 * **Example:** HS256
 * ```typescript
 * const hmac = yield* Fly.SecretKey("Hmac", {
 *   app: Site,
 *   type: "hs256",
 *   value: hmacBytes,
 * });
 * ```
 *
 * ### Encrypt
 * Bind {@link Encrypt} to a box/secretbox/AEAD key. Provide
 * {@link EncryptHttp}. Optional `associatedData` is AEAD associated
 * data.
 *
 * Fly crypto ops need a KMS token. Org API tokens are typed
 * `Forbidden`. Encrypt and sign from a {@link Service}, not a laptop
 * Action.
 *
 * **Example:** Encrypt a payload
 * ```typescript
 * const encrypt = yield* Fly.Encrypt(Box);
 * const { ciphertext } = yield* encrypt({
 *   plaintext: new TextEncoder().encode("attack at dawn"),
 * });
 * ```
 *
 * ### Decrypt
 * Bind {@link Decrypt} to the same key. Plaintext comes back
 * `Redacted`. Unwrap with `Redacted.value`. `associatedData` must
 * match encryption. Provide {@link DecryptHttp}.
 *
 * **Example:** Decrypt a payload
 * ```typescript
 * const decrypt = yield* Fly.Decrypt(Box);
 * const { plaintext } = yield* decrypt({ ciphertext });
 * const bytes = Redacted.value(plaintext);
 * ```
 *
 * ### Sign
 * Bind {@link Sign} to a signing key (`nacl_sign`, `hs256`, `es256`,
 * …). The private key never leaves Fly KMS. Provide {@link SignHttp}.
 *
 * **Example:** Sign a payload
 * ```typescript
 * const sign = yield* Fly.Sign(Signing);
 * const { signature } = yield* sign({
 *   plaintext: new TextEncoder().encode("release-manifest-v1"),
 * });
 * ```
 *
 * ### Verify
 * Bind {@link Verify} to the same key. A bad signature is a typed
 * error from the Machines API. Provide {@link VerifyHttp}.
 *
 * **Example:** Verify a signature
 * ```typescript
 * const verify = yield* Fly.Verify(Signing);
 * const { valid } = yield* verify({ plaintext, signature });
 * ```
 *
 * @resource
 */
export const SecretKey = Object.assign((id, props) => SecretKeyResource(id, resolveSecretKeyProps(props)), SecretKeyResource);
export class SecretKeyNotCreated extends Data.TaggedError("Fly.SecretKeyNotCreated") {
}
export class SecretKeyAppRequired extends Data.TaggedError("Fly.SecretKeyAppRequired") {
}
const appNameOf = (value) => {
    if (value === null || typeof value !== "object")
        return undefined;
    const rec = value;
    return typeof rec.appName === "string" && rec.appName.length > 0
        ? rec.appName
        : undefined;
};
const resolveName = (id, name, existing) => Effect.gen(function* () {
    if (name !== undefined)
        return sanitizeFlyVolumeName(name);
    if (existing !== undefined)
        return existing;
    return yield* createFlyVolumeName(id);
});
const toAttrs = (appName, key, fallbackName) => ({
    appName,
    name: key.name ?? fallbackName,
    type: key.type,
    publicKey: key.public_key,
    createdAt: key.created_at,
    updatedAt: key.updated_at,
});
const getByName = (appName, secretName) => machines
    .getSecretKey({
    app_name: appName,
    secret_name: secretName,
})
    .pipe(Effect.catchTag("NotFound", () => Effect.succeed(undefined)));
const listKeys = (appName) => machines.listSecretKeys({ app_name: appName }).pipe(Effect.map((res) => res.secret_keys ?? []), Effect.catchTag(["NotFound", "Forbidden"], () => Effect.succeed([])));
const putKey = (input) => {
    if (input.value !== undefined) {
        return machines.setSecretKey({
            app_name: input.appName,
            secret_name: input.secretName,
            type: input.type,
            value: [...input.value],
        });
    }
    return machines.generateSecretKey({
        app_name: input.appName,
        secret_name: input.secretName,
        type: input.type,
    });
};
const valuesEqual = (left, right) => {
    if (left === undefined && right === undefined)
        return true;
    if (left === undefined || right === undefined)
        return false;
    return deepEqual(left, right);
};
export const SecretKeyProvider = () => Provider.succeed(SecretKey, {
    stables: ["appName", "name", "type", "publicKey", "createdAt"],
    nuke: { dependsOn: ["Fly.App"] },
    diff: Effect.fn(function* ({ news, output }) {
        if (news === undefined || !isResolved(news))
            return undefined;
        if (output === undefined)
            return undefined;
        const desiredName = news.name !== undefined
            ? sanitizeFlyVolumeName(news.name)
            : output.name;
        const nameChanged = desiredName !== output.name;
        const nextApp = appNameOf(news.app);
        const appChanged = nextApp !== undefined && nextApp !== output.appName;
        const typeChanged = news.type !== undefined &&
            output.type !== undefined &&
            news.type !== output.type;
        if (nameChanged || appChanged || typeChanged) {
            return {
                action: "replace",
                // Same (app, name) cannot hold two types — delete first.
                deleteFirst: !nameChanged && !appChanged,
            };
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ id, olds, output }) {
        const appName = output?.appName ??
            (olds !== undefined ? appNameOf(olds.app) : undefined);
        if (appName === undefined)
            return undefined;
        const name = yield* resolveName(id, olds?.name, output?.name);
        const found = yield* getByName(appName, name);
        if (found === undefined)
            return undefined;
        const attrs = toAttrs(appName, found, name);
        if (output !== undefined)
            return attrs;
        return matchesAlchemyPhysicalName(name) ? attrs : Unowned(attrs);
    }),
    list: Effect.fn(function* () {
        const apps = yield* listOwnedApps();
        const rows = yield* Effect.forEach(apps, (app) => listKeys(app.appName).pipe(Effect.map((keys) => keys.flatMap((key) => {
            const name = key.name;
            if (!matchesAlchemyPhysicalName(name))
                return [];
            return [toAttrs(app.appName, key, name ?? "")];
        }))), { concurrency: 8 });
        return rows.flat();
    }),
    reconcile: Effect.fn(function* ({ id, news, olds, output }) {
        const props = news ?? {};
        const appName = appNameOf(props.app) ?? output?.appName;
        if (appName === undefined) {
            return yield* new SecretKeyAppRequired({
                message: "SecretKey requires a resolved Fly.App",
            });
        }
        const name = yield* resolveName(id, props.name, output?.name);
        // Observe by cached identity, then the desired (app, name).
        let current = output !== undefined
            ? yield* getByName(output.appName, output.name)
            : undefined;
        if (current === undefined &&
            (output === undefined ||
                output.appName !== appName ||
                output.name !== name)) {
            current = yield* getByName(appName, name);
        }
        if (current === undefined) {
            yield* putKey({
                appName,
                secretName: name,
                type: props.type,
                value: props.value,
            }).pipe(Effect.catchTag("Conflict", () => Effect.void));
            current = yield* getByName(appName, name);
        }
        if (current === undefined) {
            return yield* new SecretKeyNotCreated({ appName, name });
        }
        // Sync — re-set when the caller supplied new material. Observed
        // cloud never returns private bytes; `olds.value` is only a hint.
        const desiredValue = props.value;
        if (desiredValue !== undefined) {
            const previousValue = olds?.value;
            const shouldSet = previousValue === undefined ||
                !valuesEqual(previousValue, desiredValue);
            if (shouldSet) {
                yield* putKey({
                    appName,
                    secretName: name,
                    type: props.type ?? current.type,
                    value: desiredValue,
                }).pipe(Effect.catchTag("Conflict", () => Effect.void));
                current = (yield* getByName(appName, name)) ?? current;
            }
        }
        return toAttrs(appName, current, name);
    }),
    delete: Effect.fn(function* ({ output }) {
        if (output.appName.length === 0 || output.name.length === 0)
            return;
        yield* machines
            .deleteSecretKey({
            app_name: output.appName,
            secret_name: output.name,
        })
            .pipe(Effect.catchTag("NotFound", () => Effect.void));
        yield* getByName(output.appName, output.name).pipe(Effect.map((key) => key === undefined), Effect.repeat({
            schedule: Schedule.spaced("1 second"),
            until: (gone) => gone,
            times: 8,
        }));
    }),
});
//# sourceMappingURL=SecretKey.js.map