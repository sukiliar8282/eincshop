// Coverage verdicts for the remaining `emr-containers` operations:
// - create/describe/list SecurityConfiguration: out of scope as a Resource —
//   the API has NO DeleteSecurityConfiguration, so a provisioned config can
//   never be destroyed (violates destroy/zero-orphan semantics); neither
//   Terraform nor CloudFormation models it. VirtualCluster accepts a
//   `securityConfigurationId` prop for configs created out of band.
// - create/delete ManagedEndpoint: resource lifecycle of an object that
//   requires a live EKS cluster + RUNNING virtual cluster + EMR Studio
//   setup; not modeled by Terraform/CloudFormation. The data plane is
//   covered (DescribeManagedEndpoint, ListManagedEndpoints,
//   GetManagedEndpointSessionCredentials).
// - tagResource/untagResource/listTagsForResource: covered by the
//   VirtualCluster/JobTemplate providers' tag sync.
export * from "./CancelJobRun.js";
export * from "./CancelJobRunHttp.js";
export * from "./DescribeJobRun.js";
export * from "./DescribeJobRunHttp.js";
export * from "./DescribeJobTemplate.js";
export * from "./DescribeJobTemplateHttp.js";
export * from "./DescribeManagedEndpoint.js";
export * from "./DescribeManagedEndpointHttp.js";
export * from "./DescribeVirtualCluster.js";
export * from "./DescribeVirtualClusterHttp.js";
export * from "./GetManagedEndpointSessionCredentials.js";
export * from "./GetManagedEndpointSessionCredentialsHttp.js";
export * from "./JobRunEventSource.js";
export * from "./JobTemplate.js";
export * from "./ListJobRuns.js";
export * from "./ListJobRunsHttp.js";
export * from "./ListJobTemplates.js";
export * from "./ListJobTemplatesHttp.js";
export * from "./ListManagedEndpoints.js";
export * from "./ListManagedEndpointsHttp.js";
export * from "./ListVirtualClusters.js";
export * from "./ListVirtualClustersHttp.js";
export * from "./StartJobRun.js";
export * from "./StartJobRunHttp.js";
export * from "./VirtualCluster.js";
//# sourceMappingURL=index.js.map