import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import path from "pathe";
import { writeFileAtomic } from "../Util/AtomicFile.js";
import { profileCommandHint } from "../Util/interactive.js";
import { AuthError } from "./AuthProvider.js";
import { profileCredentialsDirPath } from "./Paths.js";
import { validateProfileName } from "./Profile.js";
export const credentialsFilePath = (profile, provider) => path.join(profileCredentialsDirPath(profile), `${provider}.json`);
export class CredentialsStore extends Context.Service()("Alchemy::CredentialsStore") {
}
export const CredentialsStoreLive = Layer.effect(CredentialsStore, Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const read = (profile, provider, schema) => Effect.gen(function* () {
        const filePath = yield* validateCredentialPath(profile, provider);
        const data = yield* fs.readFileString(filePath).pipe(Effect.catchReason("PlatformError", "NotFound", () => Effect.succeed(undefined)), Effect.mapError((cause) => new AuthError({
            message: `Could not read credentials at '${filePath}'.`,
            cause,
        })));
        if (data === undefined)
            return undefined;
        const json = yield* Schema.decodeUnknownEffect(Schema.fromJsonString(Schema.Unknown))(data).pipe(Effect.mapError((cause) => new AuthError({
            message: `Stored credentials at '${filePath}' contain invalid JSON.`,
            cause,
        })));
        const command = yield* profileCommandHint(`alchemy profile edit --profile ${profile} --reconfigure ${provider}`);
        return yield* Schema.decodeUnknownEffect(schema)(json).pipe(Effect.mapError((cause) => new AuthError({
            message: `Stored credentials at '${filePath}' do not match the expected shape. ` +
                `Run \`${command}\` to replace them.`,
            cause,
        })));
    });
    const write = (profile, provider, schema, credentials) => Effect.gen(function* () {
        const filePath = yield* validateCredentialPath(profile, provider);
        const encoded = yield* Schema.encodeEffect(schema)(credentials).pipe(Effect.mapError((cause) => new AuthError({
            message: `Credentials for '${provider}' do not match the declared schema.`,
            cause,
        })));
        yield* Effect.gen(function* () {
            const directory = path.dirname(filePath);
            yield* fs.makeDirectory(directory, { recursive: true });
            yield* fs.chmod(directory, 0o700);
            yield* writeFileAtomic(fs, filePath, JSON.stringify(encoded, null, 2), 0o600);
        }).pipe(Effect.mapError((cause) => new AuthError({
            message: `Could not write credentials at '${filePath}'.`,
            cause,
        })));
    });
    const remove_ = (profile, provider) => validateCredentialPath(profile, provider).pipe(Effect.flatMap((filePath) => fs.remove(filePath).pipe(Effect.catchReason("PlatformError", "NotFound", () => Effect.void), Effect.mapError((cause) => new AuthError({
        message: `Could not delete credentials at '${filePath}'.`,
        cause,
    })))));
    const deleteProfile = (profile) => Effect.gen(function* () {
        yield* validateProfileName(profile).pipe(Effect.mapError((cause) => new AuthError({ message: cause.message, cause })));
        yield* fs
            .remove(profileCredentialsDirPath(profile), { recursive: true })
            .pipe(Effect.catchReason("PlatformError", "NotFound", () => Effect.void), Effect.mapError((cause) => new AuthError({
            message: `Could not delete credentials for profile '${profile}'.`,
            cause,
        })));
    });
    return {
        read,
        write,
        delete: remove_,
        deleteProfile,
    };
}));
const CREDENTIAL_KEY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const validateCredentialPath = (profile, provider) => Effect.gen(function* () {
    yield* validateProfileName(profile).pipe(Effect.mapError((cause) => new AuthError({ message: cause.message, cause })));
    if (!CREDENTIAL_KEY_PATTERN.test(provider)) {
        return yield* new AuthError({
            message: `Invalid credential key '${provider}'.`,
        });
    }
    return credentialsFilePath(profile, provider);
});
export function displayRedacted(r, visibleChars = 4) {
    const raw = Redacted.value(r);
    if (raw.length <= visibleChars)
        return "****";
    return `${raw.slice(0, visibleChars)}****`;
}
//# sourceMappingURL=Credentials.js.map