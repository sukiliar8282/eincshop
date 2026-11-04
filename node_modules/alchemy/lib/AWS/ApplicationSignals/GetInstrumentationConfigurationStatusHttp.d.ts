import * as Layer from "effect/Layer";
import { GetInstrumentationConfigurationStatus } from "./GetInstrumentationConfigurationStatus.ts";
/**
 * Bespoke implementation (not built on the shared scaffolding): the runtime
 * callable injects the bound configuration's full identity — the
 * type/service/environment/signal quadruple plus the location hash —
 * rather than a single identifier field.
 */
export declare const GetInstrumentationConfigurationStatusHttp: Layer.Layer<GetInstrumentationConfigurationStatus, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=GetInstrumentationConfigurationStatusHttp.d.ts.map