import * as Effect from "effect/Effect";
import * as Match from "effect/Match";
import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import * as Stream from "effect/Stream";
import * as ChildProcess from "effect/unstable/process/ChildProcess";
import { ChildProcessSpawner } from "effect/unstable/process/ChildProcessSpawner";
import { AuthError, AuthProviderLayer, NeedsReauth, refreshHint, } from "../Auth/AuthProvider.js";
import { displayRedacted } from "../Auth/Credentials.js";
import { getEnvRedacted, mapPromptCancellation } from "../Auth/Env.js";
import { storedSecret, storedValueText, validateFieldValues, } from "../Auth/StoredAuthProvider.js";
import * as Interaction from "../Interaction.js";
import { githubHostname, normalizeGitHubBaseUrl, resolveGitHubBaseUrlFromEnv, } from "./BaseUrl.js";
const options = [
    {
        value: "gh-cli",
        label: "GitHub CLI",
        description: "delegate to `gh auth token` (run `gh auth login` first)",
    },
    {
        value: "stored",
        label: "Personal Access Token",
        description: "enter PAT interactively and store it in the profile",
    },
];
/** Typed values stored in a GitHub provider profile document. */
export const GitHubAuthConfigSchema = Schema.Union([
    Schema.Struct({
        method: Schema.Literal("stored"),
        token: Schema.String,
        baseUrl: Schema.optionalKey(Schema.String),
    }),
    Schema.Struct({
        method: Schema.Literal("gh-cli"),
        // v0 delegated to `gh auth token` and therefore had no inline token.
        // Keep that migration state readable; the first credential resolution
        // captures the token inline through updateConfig.
        token: Schema.optionalKey(Schema.String),
        baseUrl: Schema.optionalKey(Schema.String),
    }),
]);
export const GITHUB_AUTH_PROVIDER_NAME = "GitHub";
class GhCliError extends Error {
    _tag = "GhCliError";
}
const readEnvTokenFor = (baseUrl) => Effect.gen(function* () {
    const candidates = baseUrl !== undefined
        ? [
            "GH_ENTERPRISE_TOKEN",
            "GITHUB_ENTERPRISE_TOKEN",
            "GITHUB_ACCESS_TOKEN",
            "GITHUB_TOKEN",
        ]
        : ["GITHUB_ACCESS_TOKEN", "GITHUB_TOKEN"];
    for (const key of candidates) {
        const token = yield* getEnvRedacted(key);
        if (token) {
            return {
                type: "token",
                token,
                baseUrl,
                source: { type: "env", details: key },
            };
        }
    }
    return yield* new AuthError({
        message: `GitHub env credentials not found. Set ${candidates.join(", ")}.`,
    });
});
/** Resolve standalone GitHub credentials from environment variables. */
export const readEnvCredentials = (configBaseUrl) => Effect.gen(function* () {
    const baseUrl = configBaseUrl ?? (yield* resolveGitHubBaseUrlFromEnv);
    return yield* readEnvTokenFor(baseUrl);
});
export const makeGitHubAuth = (authOptions) => AuthProviderLayer()(GITHUB_AUTH_PROVIDER_NAME, Effect.gen(function* () {
    // Deferred accessors, NOT `yield* Interaction.Interaction`: resolving the service
    // at impl build would put the terminal in the registration layer's
    // requirements, and child processes (which only ever call `read`) build
    // this layer with no interaction services at all.
    const interaction = Interaction.accessors;
    const cp = yield* ChildProcessSpawner;
    // Hard-coded host from `providers({ baseUrl })`, resolved once at layer
    // build. Kept as an object so "no option" (undefined) is distinct from
    // "option normalized to the github.com default" ({ baseUrl: undefined })
    // — both matter: the latter still pins the host and mutes the prompt.
    const fixed = authOptions?.baseUrl !== undefined
        ? {
            baseUrl: yield* normalizeGitHubBaseUrl(authOptions.baseUrl).pipe(Effect.orDie),
        }
        : undefined;
    // The host every method authenticates against: the hard-coded value
    // wins, then the profile's configured host, then the environment.
    const effectiveBaseUrl = (config) => fixed !== undefined
        ? Effect.succeed(fixed.baseUrl)
        : config.baseUrl !== undefined
            ? Effect.succeed(config.baseUrl)
            : resolveGitHubBaseUrlFromEnv;
    const ghCliToken = (hostname) => Effect.gen(function* () {
        const handle = yield* cp.spawn(ChildProcess.make("gh", [
            "auth",
            "token",
            ...(hostname !== undefined ? ["--hostname", hostname] : []),
        ], { shell: false }));
        const [exitCode, stdout, stderr] = yield* Effect.all([
            handle.exitCode,
            Stream.mkString(Stream.decodeText(handle.stdout)),
            Stream.mkString(Stream.decodeText(handle.stderr)),
        ], { concurrency: 3 });
        if (exitCode !== 0) {
            return yield* Effect.fail(new GhCliError(`gh auth token exited with ${exitCode}: ${stderr.trim() || stdout.trim()}`));
        }
        const token = stdout.trim();
        if (!token) {
            return yield* Effect.fail(new GhCliError("gh auth token returned empty output"));
        }
        return token;
    }).pipe(Effect.scoped, Effect.mapError((e) => e instanceof GhCliError
        ? new AuthError({ message: e.message, cause: e })
        : new AuthError({
            message: "Could not invoke `gh`. Install GitHub CLI from https://cli.github.com/ and run `gh auth login`.",
            cause: e,
        })));
    const loginStored = Effect.fn(function* (baseUrl) {
        const token = yield* interaction.prompt
            .password({
            message: "GitHub Personal Access Token",
            description: "Requires `repo` scope and `workflow` for GitHub Actions.",
            validate: (v) => (v.length === 0 ? "Required" : undefined),
        })
            .pipe(mapPromptCancellation);
        yield* interaction.output.success("GitHub: credentials saved.");
        return { method: "stored", token, baseUrl };
    });
    // Optional GitHub Enterprise host. Blank means github.com; anything else
    // is normalized into the REST API base URL (GHES gets `/api/v3`
    // appended, data-residency hosts get the `api.` prefix).
    const promptBaseUrl = interaction.prompt
        .text({
        message: "GitHub host",
        description: "Leave blank for github.com; use a hostname such as github.example.com for GitHub Enterprise.",
        placeholder: "github.com",
        defaultValue: "",
    })
        .pipe(mapPromptCancellation, Effect.flatMap((input) => {
        const trimmed = (input ?? "").trim();
        return trimmed === ""
            ? Effect.succeed(undefined)
            : normalizeGitHubBaseUrl(trimmed);
    }));
    const configureInteractive = (_profileName) => Effect.gen(function* () {
        const method = yield* interaction.prompt.select({
            message: "GitHub authentication method",
            options,
        });
        // The host prompt is skipped when providers({ baseUrl }) pinned it —
        // nothing is stored in the profile config; `read` re-applies the
        // pinned value from code on every resolution.
        const baseUrl = fixed !== undefined ? undefined : yield* promptBaseUrl;
        const verifyHost = fixed !== undefined ? fixed.baseUrl : baseUrl;
        return yield* Match.value(method).pipe(Match.when("gh-cli", () => ghCliToken(verifyHost !== undefined
            ? githubHostname(verifyHost)
            : undefined).pipe(Effect.map((token) => ({
            method: "gh-cli",
            token,
            baseUrl,
        })), Effect.mapError((e) => new AuthError({
            message: `gh CLI not available: ${e.message}`,
            cause: e,
        })))), Match.when("stored", () => loginStored(baseUrl)), Match.exhaustive);
    });
    const configureCredentials = (profileName) => configureInteractive(profileName).pipe(Effect.mapError((e) => new AuthError({
        message: "failed to configure credentials",
        cause: e,
    })));
    const resolveCredentials = (profileName, config, updateConfig) => Match.value(config).pipe(Match.when({ method: "stored" }, Effect.fn(function* (c) {
        const baseUrl = yield* effectiveBaseUrl(c);
        return {
            type: "token",
            token: Redacted.make(c.token),
            baseUrl,
            source: { type: "stored" },
        };
    })), Match.when({ method: "gh-cli" }, Effect.fn(function* (c) {
        const baseUrl = yield* effectiveBaseUrl(c);
        const token = c.token ??
            (yield* ghCliToken(baseUrl !== undefined ? githubHostname(baseUrl) : undefined).pipe(Effect.mapError((cause) => new NeedsReauth({
                provider: GITHUB_AUTH_PROVIDER_NAME,
                profile: profileName,
                message: `GitHub CLI credentials need to be refreshed. ${refreshHint(GITHUB_AUTH_PROVIDER_NAME, profileName)}`,
                cause,
            }))));
        if (c.token === undefined && updateConfig !== undefined) {
            yield* updateConfig({ ...c, token });
        }
        return {
            type: "token",
            token: Redacted.make(token),
            baseUrl,
            source: { type: "gh-cli" },
        };
    })), Match.exhaustive);
    const logout = (_profileName, config) => Match.value(config).pipe(Match.when({ method: "gh-cli" }, () => Effect.void), Match.when({ method: "stored" }, () => Effect.void), Match.exhaustive);
    const login = (_profileName, config) => Match.value(config)
        .pipe(Match.when({ method: "gh-cli" }, (c) => effectiveBaseUrl(c).pipe(Effect.flatMap((baseUrl) => ghCliToken(baseUrl !== undefined ? githubHostname(baseUrl) : undefined)), Effect.tap(() => interaction.output.success("GitHub: gh CLI authentication available.")), Effect.map((token) => ({ ...c, token })))), Match.when({ method: "stored" }, (c) => Effect.succeed(c)), Match.exhaustive)
        .pipe(Effect.mapError((e) => new AuthError({ message: "login failed", cause: e })));
    const details = (profileName, config, updateConfig) => resolveCredentials(profileName, config, updateConfig).pipe(Effect.map((creds) => {
        const sourceStr = creds.source.details
            ? `${creds.source.type} - ${creds.source.details}`
            : creds.source.type;
        return {
            lines: [
                { key: "token", value: displayRedacted(creds.token, 6) },
                { key: "source", value: sourceStr },
                ...(creds.baseUrl !== undefined
                    ? [{ key: "baseUrl", value: creds.baseUrl }]
                    : []),
            ],
        };
    }));
    // Flag-driven configuration covers the "stored" (PAT) method only;
    // "gh-cli" requires an interactive `gh auth login` session and is
    // deliberately absent from configureMethods.
    const storedFields = [
        {
            name: "token",
            label: "GitHub Personal Access Token",
            description: "Requires `repo` scope and `workflow` for GitHub Actions.",
            secret: true,
        },
        {
            name: "baseUrl",
            label: "GitHub host",
            description: "Leave blank for github.com; use a hostname such as github.example.com for GitHub Enterprise.",
            optional: true,
        },
    ];
    const configureMethods = [
        { method: "stored", fields: storedFields },
    ];
    const configureWith = (_profileName, input) => input.method === "stored"
        ? validateFieldValues(GITHUB_AUTH_PROVIDER_NAME, storedFields, input.values).pipe(Effect.flatMap(Effect.fn(function* (values) {
            // A hard-coded providers({ baseUrl }) pins the host; nothing
            // is stored in the profile config in that case (mirrors the
            // interactive configure flow).
            const baseUrl = fixed !== undefined
                ? undefined
                : values.baseUrl !== undefined
                    ? yield* normalizeGitHubBaseUrl(storedValueText(values.baseUrl) ?? "")
                    : undefined;
            const token = Redacted.value(storedSecret(values.token) ?? Redacted.make(""));
            yield* interaction.output.success("GitHub: credentials saved.");
            return { method: "stored", token, baseUrl };
        })))
        : Effect.fail(new AuthError({
            message: `GitHub: unknown method '${input.method}'. Valid methods: stored. (gh-cli is interactive-only.)`,
        }));
    return {
        configSchema: GitHubAuthConfigSchema,
        configure: configureCredentials,
        configureWith,
        configureMethods,
        logout,
        login,
        details,
        read: resolveCredentials,
        readEnvironment: readEnvCredentials(fixed !== undefined ? fixed.baseUrl : undefined),
        environment: [
            {
                name: "GITHUB_ACCESS_TOKEN",
                required: true,
                secret: true,
                alternatives: [
                    "GITHUB_TOKEN",
                    "GH_ENTERPRISE_TOKEN",
                    "GITHUB_ENTERPRISE_TOKEN",
                ],
                description: "Personal access token. The enterprise variants are only consulted when a GitHub Enterprise host is configured.",
            },
            {
                name: "GITHUB_BASE_URL",
                required: false,
                alternatives: ["GITHUB_API_URL", "GH_HOST"],
                description: "GitHub Enterprise host or REST API base URL.",
            },
        ],
    };
}));
/**
 * The default GitHub AuthProvider layer — {@link makeGitHubAuth} with no
 * hard-coded host. Use `GitHub.providers({ baseUrl })` (or
 * `makeGitHubAuth({ baseUrl })` directly) to pin a GitHub Enterprise host.
 */
export const GitHubAuth = makeGitHubAuth();
//# sourceMappingURL=AuthProvider.js.map