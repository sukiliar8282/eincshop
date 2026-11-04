import * as Layer from "effect/Layer";
import { ListDomains } from "./ListDomains.ts";
/**
 * Account-level binding — bespoke rather than `makeSimpleDbBinding` because
 * `ListDomains` targets no single domain: SimpleDB IAM cannot scope it
 * narrower than every domain in the account, so the grant is
 * `sdb:ListDomains` on `domain/*` (expressed as `*`).
 */
export declare const ListDomainsHttp: Layer.Layer<ListDomains, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ListDomainsHttp.d.ts.map