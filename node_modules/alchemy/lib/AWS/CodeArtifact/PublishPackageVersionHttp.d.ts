import * as Layer from "effect/Layer";
import { PublishPackageVersion } from "./PublishPackageVersion.ts";
/** HTTP implementation of {@link PublishPackageVersion} over the CodeArtifact API. */
export declare const PublishPackageVersionHttp: Layer.Layer<PublishPackageVersion, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=PublishPackageVersionHttp.d.ts.map