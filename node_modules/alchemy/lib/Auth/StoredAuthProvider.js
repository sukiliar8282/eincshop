import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import * as Interaction from "../Interaction.js";
import { AuthError, AuthProviderLayer, } from "./AuthProvider.js";
import { displayRedacted } from "./Credentials.js";
import { mapPromptCancellation } from "./Env.js";
/** Reveal a collected value only at a validation or I/O boundary. */
export const storedValueText = (value) => value === undefined
    ? undefined
    : Redacted.isRedacted(value)
        ? Redacted.value(value)
        : value;
/** Preserve or introduce redaction for a collected secret. */
export const storedSecret = (value) => value === undefined
    ? undefined
    : Redacted.isRedacted(value)
        ? value
        : Redacted.make(value);
/**
 * Validate flag-provided values against the field specs: unknown keys,
 * missing required fields, and per-field validators all fail with an
 * actionable {@link AuthError}.
 */
export const validateFieldValues = (provider, fields, values) => Effect.gen(function* () {
    const known = new Set(fields.map((field) => field.name));
    for (const key of Object.keys(values)) {
        if (!known.has(key)) {
            return yield* Effect.fail(new AuthError({
                message: `${provider}: unknown field '${key}'. ` +
                    `Valid fields: ${[...known].join(", ")}.`,
            }));
        }
    }
    const collected = {};
    for (const field of fields) {
        const raw = values[field.name] ?? field.defaultValue;
        if (raw === undefined || raw.length === 0) {
            if (field.optional)
                continue;
            return yield* Effect.fail(new AuthError({
                message: `${provider}: missing required field '${field.name}' (${field.label}). Pass it with --set ${field.name}=<value>.`,
            }));
        }
        const invalid = field.validate?.(raw);
        if (invalid !== undefined) {
            return yield* Effect.fail(new AuthError({
                message: `${provider}: invalid '${field.name}': ${invalid}`,
            }));
        }
        collected[field.name] = field.secret ? Redacted.make(raw) : raw;
    }
    return collected;
});
/**
 * Prompt for each field in order (secret fields masked, optional fields
 * skippable with an empty answer). Shared by the factory's interactive
 * `configure` and by hand-rolled multi-method providers that want the same
 * behavior for their token method.
 */
export const collectFieldValues = (fields) => Effect.gen(function* () {
    const interaction = yield* Interaction.Interaction;
    const values = {};
    for (const field of fields) {
        const description = [
            field.description,
            field.optional ? "Optional — press Enter to skip." : undefined,
        ]
            .filter((part) => part !== undefined)
            .join(" ");
        const validate = (value) => {
            if (value.length === 0)
                return field.optional ? undefined : "Required";
            return field.validate?.(value);
        };
        const request = field.secret
            ? interaction.prompt.password({
                message: field.label,
                description: description || undefined,
                placeholder: field.placeholder,
                validate,
            })
            : interaction.prompt.text({
                message: field.label,
                description: description || undefined,
                placeholder: field.placeholder,
                defaultValue: field.defaultValue,
                validate,
            });
        const answer = yield* request.pipe(mapPromptCancellation);
        if (answer.length === 0 && field.optional)
            continue;
        values[field.name] = field.secret ? Redacted.make(answer) : answer;
    }
    return values;
});
/**
 * Build a registration Layer (plus the derived inline-values schema)
 * for a single-method stored-credential provider.
 *
 * ```ts
 * export const { layer: NeonAuth, storedSchema: NeonStoredCredentials } =
 *   makeStoredAuthProvider({
 *     provider: "Neon",
 *     fields: [{ name: "apiKey", label: "Neon API Key", secret: true }],
 *     toResolved: (values, source) => ({ ... }),
 *     readEnvironment: ...,
 *     environment: [...],
 *   });
 * ```
 */
export const makeStoredAuthProvider = (config) => {
    const { provider, fields } = config;
    const fieldSchemas = Object.fromEntries(fields.map((field) => [
        field.name,
        field.optional ? Schema.optional(Schema.String) : Schema.String,
    ]));
    const storedSchema = Schema.Struct(fieldSchemas);
    const configSchema = Schema.Struct({
        method: Schema.Literal("stored"),
        ...fieldSchemas,
    });
    const layer = AuthProviderLayer()(provider, Effect.gen(function* () {
        const interaction = Interaction.accessors;
        const persist = (_profileName, values) => Effect.gen(function* () {
            const complete = config.complete?.(values) ?? Effect.succeed(values);
            const completed = yield* complete;
            yield* interaction.output.success(`${provider}: credentials saved.`);
            return {
                method: "stored",
                ...Object.fromEntries(Object.entries(completed).map(([key, value]) => [
                    key,
                    storedValueText(value),
                ])),
            };
        });
        const configure = (profileName) => collectFieldValues(fields).pipe(Effect.flatMap((values) => persist(profileName, values)));
        const configureWith = (profileName, input) => input.method === "stored"
            ? validateFieldValues(provider, fields, input.values).pipe(Effect.flatMap((values) => persist(profileName, values)))
            : Effect.fail(new AuthError({
                message: `${provider}: unknown method '${input.method}'. Valid methods: stored.`,
            }));
        const read = (_profileName, values) => Effect.succeed(config.toResolved(values, "stored"));
        const login = (_profileName, values) => Effect.succeed(values);
        const logout = (_profileName, _config) => Effect.void;
        const details = (_profileName, values) => Effect.succeed({
            lines: fields.flatMap((field) => {
                const value = values[field.name];
                if (value === undefined)
                    return [];
                return [
                    {
                        key: field.name,
                        value: field.secret
                            ? displayRedacted(storedSecret(value) ?? Redacted.make(""))
                            : (storedValueText(value) ?? ""),
                    },
                ];
            }),
        });
        const configureMethods = [
            { method: "stored", fields },
        ];
        return {
            configSchema,
            configure,
            configureWith,
            configureMethods,
            login,
            logout,
            details,
            read,
            readEnvironment: config.readEnvironment,
            environment: config.environment,
        };
    }));
    return { layer, storedSchema };
};
//# sourceMappingURL=StoredAuthProvider.js.map