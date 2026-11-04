import * as Layer from "effect/Layer";
import { CopyPackageVersions } from "./CopyPackageVersions.ts";
/**
 * HTTP implementation of {@link CopyPackageVersions} over the CodeArtifact
 * API. Bespoke (not the shared repository scaffolding): the bound repository
 * is injected as `destinationRepository`, and the copy also reads from the
 * caller-chosen source repository, so the grant spans every repository and
 * package in the domain.
 */
export declare const CopyPackageVersionsHttp: Layer.Layer<CopyPackageVersions, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=CopyPackageVersionsHttp.d.ts.map