import * as Layer from "effect/Layer";
import { BucketEventSource as S3BucketEventSource } from "../S3/BucketEventSource.ts";
import * as Lambda from "./Function.ts";
/**
 * Connects an S3 bucket notification stream to the current Lambda function.
 *
 * This layer listens for bucket notifications routed through the Lambda runtime
 * and exposes them as an `Effect.Stream`, while the companion policy configures
 * the invoke permission and bucket notification binding during deployment.
 * ### Wiring Events
 * **Example:** Listen for Object Created Events
 * ```typescript
 * yield* AWS.Lambda.BucketEventSource(
 *   bucket,
 *   { events: ["s3:ObjectCreated:*"] },
 *   (events) => Stream.runForEach(events, (event) => Effect.log(event.key)),
 * );
 * ```
 *
 * @binding
 */
export declare const BucketEventSource: Layer.Layer<S3BucketEventSource, never, Lambda.Function>;
//# sourceMappingURL=BucketEventSource.d.ts.map