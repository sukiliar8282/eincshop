import * as Layer from "effect/Layer";
import { makeOsisIngestBinding } from "./BindingHttp.js";
import { Ingest } from "./Ingest.js";
export const IngestHttp = Layer.effect(Ingest, makeOsisIngestBinding);
//# sourceMappingURL=IngestHttp.js.map