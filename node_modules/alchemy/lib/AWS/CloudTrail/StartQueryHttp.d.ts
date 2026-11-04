import * as Layer from "effect/Layer";
import { StartQuery } from "./StartQuery.ts";
/**
 * Bespoke (not scaffolded): the runtime callable resolves the bound store's
 * ID out of its ARN and threads it through a `QueryStatement` callback —
 * CloudTrail Lake SQL references the store by ID in the `FROM` clause rather
 * than as a request field.
 */
export declare const StartQueryHttp: Layer.Layer<StartQuery, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=StartQueryHttp.d.ts.map