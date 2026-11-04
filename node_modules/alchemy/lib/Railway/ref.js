const SHARED = "shared";
const namespaceOf = (resource) => {
    if (typeof resource === "string") {
        const trimmed = resource.trim();
        return trimmed.length > 0 ? trimmed : SHARED;
    }
    const logical = typeof resource.LogicalId === "string" ? resource.LogicalId.trim() : "";
    return logical.length > 0 ? logical : SHARED;
};
/**
 * Emit a Railway variable-reference template (`${{Service.KEY}}` or
 * `${{shared.NAME}}`). Distinct from the unexported resource-prop
 * `Ref<T>` — never export that `Ref`.
 *
 * `Railway.ref(Db, "DATABASE_URL")` returns `${{LogicalName.DATABASE_URL}}`
 * where `LogicalName` is `resource.LogicalId` (`Postgres("Db")` → `Db`).
 * Shared variables use the `"shared"` namespace:
 * `Railway.ref("shared", "SENTRY_DSN")` returns `${{shared.SENTRY_DSN}}`.
 *
 * Store the string as a {@link Variable} `value` (or on `Service.env`).
 * Railway keeps the template (`unrendered: true`) and interpolates it at
 * build/runtime — it is not a resolved URI. Use {@link ConnectPostgres}
 * when you want a typed client inside an Effect-native Service.
 *
 * Railway interpolates by service name. Set `name` on Postgres/Service to
 * the LogicalId if you need the template to resolve to that service.
 *
 * @see https://docs.railway.com/variables/reference#template-syntax
 * @see https://docs.railway.com/infrastructure-as-code/reference
 *
 * ### Reference a service variable
 * Pass a resource (or its LogicalId) and the variable key. The result is
 * a template string, not a URI.
 *
 * **Example:** Reference Postgres DATABASE_URL
 * ```typescript
 * const db = yield* Railway.Postgres("Db", { project: site });
 * yield* Railway.Variable("DatabaseUrl", {
 *   project: site,
 *   service: api,
 *   name: "DATABASE_URL",
 *   value: Railway.ref(db, "DATABASE_URL"),
 * });
 * ```
 *
 * ### Shared variables
 * `"shared"` is the environment-wide namespace (IaC `ctx.shared.NAME`).
 *
 * **Example:** Shared variable
 * ```typescript
 * env: {
 *   SENTRY_DSN: Railway.ref("shared", "SENTRY_DSN"),
 * }
 * ```
 *
 * @resource
 */
export const ref = (resource, key) => `\${{${namespaceOf(resource)}.${key}}}`;
//# sourceMappingURL=ref.js.map