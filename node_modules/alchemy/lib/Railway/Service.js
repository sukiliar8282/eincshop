import * as Effect from "effect/Effect";
import { Platform, } from "../Platform.js";
import { createRailwayHostRuntimeContext, } from "./hosted.js";
import { serveRailwayRpc } from "./rpc-server.js";
import { mintRpcToken } from "./rpc-token.js";
export const isService = (value) => typeof value === "object" &&
    value !== null &&
    value.Type === "Railway.Service";
const createServiceRuntimeContext = (id) => {
    const base = createRailwayHostRuntimeContext("Railway.Service")(id);
    const inner = base.serve;
    return Object.assign(base, {
        serve: ((handler, options) => inner((options?.shape === undefined
            ? handler
            : serveRailwayRpc(options.shape, handler)), options)),
    });
};
/**
 * A Railway.Service is a container in a Project. Point it at a public
 * image (`hashicorp/http-echo`) or an Effect program (`main`). Alchemy
 * stamps the name, creates a `*.up.railway.app` domain via
 * `serviceDomainCreate`, and deploys.
 *
 * @see https://docs.railway.com/guides/services
 *
 * ### Image service
 * Pass `image` without `main`. Railway pulls the image and runs it.
 * `url` is the generated `*.up.railway.app` hostname.
 *
 * **Example:** Public image
 * ```typescript
 * const site = yield* Railway.Project("Site");
 * const api = yield* Railway.Service("Api", {
 *   project: site,
 *   image: "hashicorp/http-echo",
 *   port: 5678,
 * });
 * ```
 *
 * :::caution[Changing `project` replaces the Service]
 * The Service is created in the new Project. The old Service is deleted.
 * :::
 *
 * ### Effect-native Service
 * A Service is a class. `main: import.meta.url` is the bundle
 * entrypoint. Alchemy bundles this file with Rolldown, generates a
 * Dockerfile (`FROM node:26-slim`), and uploads the context. Railway
 * builds the image. `build.install: ["pg"]` ships `pg` unbundled.
 *
 * **Example:** Class + Project + main
 * ```typescript
 * export default class Api extends Railway.Service<Api>()(
 *   "Api",
 *   {
 *     project: Site,
 *     main: import.meta.url,
 *     build: { install: ["pg"] },
 *   },
 *   Effect.gen(function* () {
 *     return {
 *       fetch: Effect.succeed(HttpServerResponse.text("hello")),
 *     };
 *   }),
 * ) {}
 * ```
 *
 * ### Local Docker context
 * `context` is a directory Railway builds with `up`. Mutually exclusive
 * with `image` (without `main`) and `repo`. Docker ignore files apply.
 *
 * **Example:** Upload a local Dockerfile
 * ```typescript
 * const api = yield* Railway.Service("Api", {
 *   project: site,
 *   context: "./api",
 *   port: 80,
 * });
 * ```
 *
 * ### The public URL
 * Yield the Service in the Stack. `api.url` is
 * `https://{name}.up.railway.app`.
 *
 * **Example:** Stack output
 * ```typescript
 * export default Alchemy.Stack(
 *   "MyApp",
 *   { providers: Railway.providers(), state: Alchemy.localState() },
 *   Effect.gen(function* () {
 *     const api = yield* Api;
 *     return { url: api.url };
 *   }),
 * );
 * ```
 *
 * ### Private service
 * `publicDomain: false` skips the generated `*.up.railway.app` hostname.
 * `url` / `domain` stay unset. Reach it on the private mesh at
 * `{name}.railway.internal`. Unowned generated or custom domains are
 * left alone.
 *
 * **Example:** Private-only service
 * ```typescript
 * const worker = yield* Railway.Service("Worker", {
 *   project: site,
 *   image: "hashicorp/http-echo",
 *   port: 5678,
 *   publicDomain: false,
 * });
 * ```
 *
 * ### Pin a region
 * Omit `region` to use Railway's default. Updating it is in place.
 *
 * **Example:** Region
 * ```typescript
 * const api = yield* Railway.Service("Api", {
 *   project: site,
 *   image: "hashicorp/http-echo",
 *   port: 5678,
 *   region: "us-west2",
 * });
 * ```
 *
 * ### Healthcheck
 * `healthcheckPath` (or `healthcheck`, matching Railway IaC) is the
 * HTTP path Railway probes. Railway load-balances public traffic
 * across whatever replicas are running. Alchemy does not pin a count.
 *
 * **Example:** Healthcheck
 * ```typescript
 * const api = yield* Railway.Service("Api", {
 *   project: site,
 *   image: "hashicorp/http-echo",
 *   port: 5678,
 *   healthcheck: "/health",
 * });
 * ```
 *
 * :::caution[One volume per service]
 * Railway does not give each replica its own disk. A second volume
 * on one Service fails with `Railway.MultipleVolumes`.
 * :::
 *
 * ### GitHub source
 * `repo` + `branch` is the third source, next to `image` and `main`.
 * Railway must have GitHub connected to the account.
 *
 * **Example:** GitHub repo
 * ```typescript
 * const api = yield* Railway.Service("Api", {
 *   project: site,
 *   repo: "acme/web",
 *   branch: "main",
 *   rootDirectory: "apps/api",
 *   buildCommand: "pnpm build",
 *   startCommand: "pnpm start",
 * });
 * ```
 *
 * ### Pre-deploy
 * Railway runs `preDeploy.command` after the image build and before
 * start — the same setting as the dashboard Pre-deploy Command.
 *
 * **Example:** Run migrations before traffic
 * ```typescript
 * const api = yield* Railway.Service("Api", {
 *   project: site,
 *   image: "hashicorp/http-echo",
 *   preDeploy: { command: "bun --cwd apps/api migrate" },
 * });
 * ```
 *
 * ### Cron
 * `cronSchedule` runs the service on a cron expression.
 *
 * **Example:** Cron schedule
 * ```typescript
 * const worker = yield* Railway.Service("Worker", {
 *   project: site,
 *   image: "hashicorp/http-echo",
 *   cronSchedule: "0 * * * *",
 * });
 * ```
 *
 * ### Mount a disk
 * Bind {@link MountVolume} inside init. Provide {@link MountVolumeLive}.
 *
 * **Example:** Volume
 * ```typescript
 * export default class Api extends Railway.Service<Api>()(
 *   "Api",
 *   { project: Site, image: "hashicorp/http-echo", port: 5678 },
 *   Effect.gen(function* () {
 *     const disk = yield* Railway.MountVolume(Data, { path: "/data" });
 *     return {
 *       fetch: Effect.succeed(HttpServerResponse.text(disk.path)),
 *     };
 *   }).pipe(Effect.provide(Railway.MountVolumeLive)),
 * ) {}
 * ```
 *
 * ### Schemaless RPC
 * Return methods next to `fetch`. Another Service or Function binds
 * this class and calls them over `{name}.railway.internal` with a
 * shared token. Public `*.up.railway.app` requests to `/__rpc__/*`
 * get 401.
 *
 * **Example:** Bind a Service
 * ```typescript
 * export default class Query extends Railway.Service<Query>()(
 *   "Query",
 *   { project: Site, main: import.meta.url },
 *   Effect.gen(function* () {
 *     return {
 *       greet: (name: string) => Effect.succeed(`hello ${name}`),
 *     };
 *   }),
 * ) {}
 *
 * export default class Api extends Railway.Function<Api>()(
 *   "Api",
 *   { project: Site, main: import.meta.url },
 *   Effect.gen(function* () {
 *     const query = yield* Railway.bindService(Query);
 *     return {
 *       fetch: query
 *         .greet("sam")
 *         .pipe(Effect.map((greeting) => HttpServerResponse.text(greeting))),
 *     };
 *   }),
 * ) {}
 * ```
 *
 * ### Module-scope declarations
 * Declare the Project once. Pass it into every child. Resource-valued
 * props accept the resource or an Effect producing it.
 *
 * **Example:** Module-scope Service
 * ```typescript
 * // src/api.ts
 * import * as Railway from "alchemy/Railway";
 *
 * export const Site = Railway.Project("Site");
 * export const Api = Railway.Service("Api", {
 *   project: Site,
 *   image: "hashicorp/http-echo",
 *   port: 5678,
 * });
 * ```
 *
 * @resource
 */
export const Service = Platform("Railway.Service", {
    createRuntimeContext: createServiceRuntimeContext,
    transformProps: (id, props) => Effect.gen(function* () {
        if (globalThis.__ALCHEMY_RUNTIME__)
            return props;
        const project = Effect.isEffect(props.project)
            ? yield* props.project
            : props.project;
        const environment = props.environment === undefined
            ? undefined
            : Effect.isEffect(props.environment)
                ? yield* props.environment
                : props.environment;
        const rpcToken = yield* mintRpcToken(id);
        return { ...props, project, environment, rpcToken };
    }),
});
//# sourceMappingURL=Service.js.map