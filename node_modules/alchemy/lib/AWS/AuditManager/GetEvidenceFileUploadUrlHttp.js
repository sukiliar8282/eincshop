import * as auditmanager from "@distilled.cloud/aws/auditmanager";
import * as Layer from "effect/Layer";
import { makeAuditManagerAccountHttpBinding } from "./BindingHttp.js";
import { GetEvidenceFileUploadUrl } from "./GetEvidenceFileUploadUrl.js";
export const GetEvidenceFileUploadUrlHttp = Layer.effect(GetEvidenceFileUploadUrl, makeAuditManagerAccountHttpBinding({
    tag: "AWS.AuditManager.GetEvidenceFileUploadUrl",
    operation: auditmanager.getEvidenceFileUploadUrl,
    actions: ["auditmanager:GetEvidenceFileUploadUrl"],
}));
//# sourceMappingURL=GetEvidenceFileUploadUrlHttp.js.map