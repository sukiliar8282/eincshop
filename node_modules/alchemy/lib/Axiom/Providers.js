import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { CredentialsStoreLive } from "../Auth/Credentials.js";
import { ProfileStoreLive } from "../Auth/Profile.js";
import * as Provider from "../Provider.js";
import { Annotation, AnnotationProvider } from "./Annotation.js";
import { ApiToken, ApiTokenProvider } from "./ApiToken.js";
import { AxiomAuth } from "./AuthProvider.js";
import * as Credentials from "./Credentials.js";
import { Dashboard, DashboardProvider } from "./Dashboard.js";
import { Dataset, DatasetProvider } from "./Dataset.js";
import { Monitor, MonitorProvider } from "./Monitor.js";
import { Notifier, NotifierProvider } from "./Notifier.js";
import { View, ViewProvider } from "./View.js";
import { VirtualField, VirtualFieldProvider } from "./VirtualField.js";
export { Credentials } from "@distilled.cloud/axiom/Credentials";
export class Providers extends Provider.ProviderCollection()("Axiom") {
}
/**
 * Axiom providers and credentials. Wires up Dataset, ApiToken, Notifier,
 * Monitor, Dashboard, VirtualField, View and Annotation resources, and
 * registers the Axiom AuthProvider so `alchemy profile edit` can configure it.
 */
export const providers = () => Layer.effect(Providers, Provider.collection([
    Annotation,
    ApiToken,
    Dashboard,
    Dataset,
    Monitor,
    Notifier,
    View,
    VirtualField,
])).pipe(Layer.provide(Layer.mergeAll(AnnotationProvider(), ApiTokenProvider(), DashboardProvider(), DatasetProvider(), MonitorProvider(), NotifierProvider(), ViewProvider(), VirtualFieldProvider())), Layer.provideMerge(Credentials.fromAuthProvider()), Layer.provideMerge(FetchHttpClient.layer), Layer.provideMerge(AxiomAuth), Layer.provideMerge(ProfileStoreLive), Layer.provideMerge(CredentialsStoreLive), Layer.orDie);
//# sourceMappingURL=Providers.js.map