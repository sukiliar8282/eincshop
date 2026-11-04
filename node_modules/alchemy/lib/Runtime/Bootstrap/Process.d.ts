/**
 * Shared core of the generated process bootstraps (ECS, App Runner, Batch,
 * EC2, Cloudflare Containers, MicroVM, Docker, Fly, Hetzner, Prisma).
 *
 * Each bundler used to emit its bootstrap as an inline TypeScript string —
 * a virtual module with no location on disk, whose imports mixed alchemy's
 * own dependencies (`@distilled.cloud/*`, `@effect/platform-*`) with the
 * consumer's (`alchemy`, `effect`). No directory can resolve both under an
 * isolated install (bun `--linker=isolated`, pnpm), so the imports were
 * left external and the process died at boot with `Cannot find module`.
 *
 * Now the generated entry is a three-line shim that imports ONLY
 * `alchemy/Runtime/Bootstrap/<Platform>` (resolvable from any consumer —
 * `alchemy` is its direct dependency) plus the user's `main`. Everything
 * alchemy needs lives in these real modules, whose imports resolve by the
 * ordinary rule: from the file that wrote them.
 *
 * The helpers here are the pieces every platform module composes; the
 * layer ORDER (which service is provided to which) is platform-specific and
 * stays in each module.
 */
import * as Config from "effect/Config";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { Stack } from "../../Stack.ts";
/**
 * The tag every bundled platform program registers itself under
 * (`Self`'s key). Typed loosely on purpose: the shape is the platform
 * instance, which differs per platform and is only ever read dynamically.
 */
export declare const entrypointTag: Context.Service<any, any>;
/**
 * Normalize the entrypoint export into the layer providing
 * {@link entrypointTag}: an inline-effect class default export is an Effect
 * resolving the platform instance, while the tagged form
 * (`X.make(props, impl)`) exports a Layer providing the `Self` tag.
 */
export declare const entrypointLayer: (entrypoint: unknown) => Layer.Layer<any>;
/** `Stack` from the `ALCHEMY_STACK_NAME` / `ALCHEMY_STAGE` the host injects. */
export declare const stackFromEnv: Layer.Layer<Stack, Config.ConfigError>;
/** `Stack` from constants baked in at deploy time. */
export declare const stackConstant: (name: string, stage: string) => Layer.Layer<Stack>;
/**
 * Resolve the program the bundled platform registered under `exportKey`
 * (`program` for the server/one-shot hosts, `default` for containers,
 * `handler` for Lambda), optionally under process-lifetime telemetry: built
 * once into the root scope; exporters batch on their intervals and flush
 * when the scope closes on graceful shutdown.
 */
export declare const resolveProgram: (exportKey: string, options?: {
    readonly telemetry?: boolean;
}) => Effect.Effect<any, any, any>;
/**
 * Run `program` as the process entry: log the start, exit 1 on failure.
 * With `exitOnComplete`, exit 0 explicitly once it completes (one-shot jobs
 * whose host waits on the process, e.g. Batch).
 */
export declare const runProcess: (label: string, program: Effect.Effect<unknown, unknown>, options?: {
    readonly exitOnComplete?: boolean;
}) => Promise<void>;
//# sourceMappingURL=Process.d.ts.map