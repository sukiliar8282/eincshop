/** @effect-diagnostics anyUnknownInErrorContext:off */
/**
 * INTERNAL — the "image source changed" trigger stream shared by the floci
 * dev providers that rebuild a Docker image on file change
 * ([ECS FlociTaskProvider](../ECS/FlociTaskProvider.ts),
 * [ECS FlociServiceProvider](../ECS/FlociServiceProvider.ts),
 * [Lambda FlociMicrovmImageProvider](../Lambda/FlociMicrovmImageProvider.ts)).
 * NOT exported from any service `index.ts`.
 */
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import * as Stream from "effect/Stream";
import { type ImageSourceLike } from "../ECR/ImageSource.ts";
/**
 * A stream of "the image source changed" triggers for a props bag:
 *
 * - `main` — a `Bundle.watch` over the exact module graph the deploy
 *   bundles (rebuild successes are the trigger; rebuild errors are logged
 *   and swallowed);
 * - `context` — a debounced recursive `fs.watch` of the build context (and
 *   the Dockerfile's directory when it lives outside the context);
 * - `image` (registry ref) / inline-dockerfile-only — nothing local to
 *   watch: an empty stream.
 */
export declare const imageSourceTrigger: (options: {
    /** Logical id, for log prefixes. */
    id: string;
    source: ImageSourceLike;
    isExternal: boolean | undefined;
}) => Effect.Effect<Stream.Stream<void, never, never>, import("effect/PlatformError").PlatformError, import("../../AlchemyContext.ts").AlchemyContext | import("../../Docker/Docker.ts").Docker | FileSystem.FileSystem | Path.Path>;
//# sourceMappingURL=ImageSourceTrigger.d.ts.map