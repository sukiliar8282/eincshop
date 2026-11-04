import * as ec2 from "@distilled.cloud/aws/ec2";
import { Region } from "@distilled.cloud/aws/Region";
import * as Effect from "effect/Effect";
import * as Namespace from "../../Namespace.js";
import * as Output from "../../Output.js";
import { EIP } from "./EIP.js";
import { InternetGateway } from "./InternetGateway.js";
import { NatGateway } from "./NatGateway.js";
import { Route } from "./Route.js";
import { RouteTable } from "./RouteTable.js";
import { RouteTableAssociation } from "./RouteTableAssociation.js";
import { Subnet } from "./Subnet.js";
import { Vpc } from "./Vpc.js";
import { VpcEndpoint } from "./VpcEndpoint.js";
/**
 * Creates a production-shaped VPC network from the low-level EC2 primitives.
 *
 * `Network` is the ergonomic entry point for users who want a ready-to-use VPC
 * layout without manually creating route tables, internet gateways, NAT
 * gateways, and subnet associations by hand.
 *
 * The helper still returns the underlying canonical resources so callers can
 * keep composing with raw `AWS.EC2.*` APIs when they need more control.
 * **Example:** Minimal network
 * ```typescript
 * const network = yield* AWS.EC2.Network("AppNetwork", {
 *   cidrBlock: "10.42.0.0/16",
 * });
 * ```
 *
 * **Example:** ECS-ready network with shared NAT
 * ```typescript
 * const network = yield* AWS.EC2.Network("AppNetwork", {
 *   cidrBlock: "10.42.0.0/16",
 *   availabilityZones: 2,
 *   nat: "single",
 *   gatewayEndpoints: ["s3"],
 * });
 *
 * yield* AWS.ECS.Service("ApiService", {
 *   cluster,
 *   task: apiTask,
 *   vpcId: network.vpcId,
 *   subnets: network.publicSubnetIds,
 *   assignPublicIp: true,
 * });
 * ```
 *
 * @resource
 */
export const Network = (id, props) => Namespace.push(id, Effect.gen(function* () {
    const availabilityZones = yield* resolveAvailabilityZones(props.availabilityZones);
    const subnetCidrs = deriveSubnetCidrs(props.cidrBlock, availabilityZones.length);
    const tags = props.tags;
    const vpc = yield* Vpc("Vpc", {
        cidrBlock: props.cidrBlock,
        enableDnsSupport: props.enableDnsSupport ?? true,
        enableDnsHostnames: props.enableDnsHostnames ?? true,
        tags,
    });
    const internetGateway = yield* InternetGateway("InternetGateway", {
        vpcId: vpc.vpcId,
        tags,
    });
    const publicSubnets = [];
    const privateSubnets = [];
    for (const [index, availabilityZone] of availabilityZones.entries()) {
        const publicSubnet = yield* Subnet(`PublicSubnet${index + 1}`, {
            vpcId: vpc.vpcId,
            cidrBlock: subnetCidrs.public[index],
            availabilityZone,
            mapPublicIpOnLaunch: true,
            tags: {
                // Kubernetes load-balancer subnet discovery (EKS Auto Mode and the
                // AWS Load Balancer Controller both select subnets by this tag).
                "kubernetes.io/role/elb": "1",
                ...tags,
                Tier: "public",
            },
        });
        publicSubnets.push(publicSubnet);
        const privateSubnet = yield* Subnet(`PrivateSubnet${index + 1}`, {
            vpcId: vpc.vpcId,
            cidrBlock: subnetCidrs.private[index],
            availabilityZone,
            tags: {
                // Internal load-balancer subnet discovery (see the public-subnet
                // `kubernetes.io/role/elb` note above).
                "kubernetes.io/role/internal-elb": "1",
                ...tags,
                Tier: "private",
            },
        });
        privateSubnets.push(privateSubnet);
    }
    const publicRouteTable = yield* RouteTable("PublicRouteTable", {
        vpcId: vpc.vpcId,
        tags: {
            ...tags,
            Tier: "public",
        },
    });
    const publicInternetRoute = yield* Route("PublicInternetRoute", {
        routeTableId: publicRouteTable.routeTableId,
        destinationCidrBlock: "0.0.0.0/0",
        gatewayId: internetGateway.internetGatewayId,
    });
    const publicRouteAssociations = [];
    for (const [index, subnet] of publicSubnets.entries()) {
        publicRouteAssociations.push(yield* RouteTableAssociation(`PublicSubnetAssociation${index + 1}`, {
            routeTableId: publicRouteTable.routeTableId,
            subnetId: subnet.subnetId,
        }));
    }
    const nat = props.nat ?? "none";
    const elasticIps = [];
    const natGateways = [];
    const privateRouteTables = [];
    const privateRoutes = [];
    const privateRouteAssociations = [];
    if (nat === "per-az") {
        for (const [index, subnet] of publicSubnets.entries()) {
            const eip = yield* EIP(`NatEip${index + 1}`, {
                domain: "vpc",
                tags,
            });
            elasticIps.push(eip);
            const natGateway = yield* NatGateway(`NatGateway${index + 1}`, {
                subnetId: subnet.subnetId,
                allocationId: eip.allocationId,
                connectivityType: "public",
                tags,
            });
            natGateways.push(natGateway);
            const privateRouteTable = yield* RouteTable(`PrivateRouteTable${index + 1}`, {
                vpcId: vpc.vpcId,
                tags: {
                    ...tags,
                    Tier: "private",
                },
            });
            privateRouteTables.push(privateRouteTable);
            privateRoutes.push(yield* Route(`PrivateInternetRoute${index + 1}`, {
                routeTableId: privateRouteTable.routeTableId,
                destinationCidrBlock: "0.0.0.0/0",
                natGatewayId: natGateway.natGatewayId,
            }));
            privateRouteAssociations.push(yield* RouteTableAssociation(`PrivateSubnetAssociation${index + 1}`, {
                routeTableId: privateRouteTable.routeTableId,
                subnetId: privateSubnets[index].subnetId,
            }));
        }
    }
    else {
        const privateRouteTable = yield* RouteTable("PrivateRouteTable", {
            vpcId: vpc.vpcId,
            tags: {
                ...tags,
                Tier: "private",
            },
        });
        privateRouteTables.push(privateRouteTable);
        if (nat === "single") {
            const eip = yield* EIP("NatEip", {
                domain: "vpc",
                tags,
            });
            elasticIps.push(eip);
            const natGateway = yield* NatGateway("NatGateway", {
                subnetId: publicSubnets[0].subnetId,
                allocationId: eip.allocationId,
                connectivityType: "public",
                tags,
            });
            natGateways.push(natGateway);
            privateRoutes.push(yield* Route("PrivateInternetRoute", {
                routeTableId: privateRouteTable.routeTableId,
                destinationCidrBlock: "0.0.0.0/0",
                natGatewayId: natGateway.natGatewayId,
            }));
        }
        for (const [index, subnet] of privateSubnets.entries()) {
            privateRouteAssociations.push(yield* RouteTableAssociation(`PrivateSubnetAssociation${index + 1}`, {
                routeTableId: privateRouteTable.routeTableId,
                subnetId: subnet.subnetId,
            }));
        }
    }
    const gatewayEndpoints = [];
    const endpointServices = uniqueGatewayEndpoints(props.gatewayEndpoints);
    if (endpointServices.length > 0) {
        // Resolve the region lazily and via the `Region` service, which is
        // provided both at deploy time and by the Lambda runtime.
        // `AWSEnvironment` is deploy-time-only: this layer is re-executed at
        // Function init, where `AWS::Environment` is not provided and
        // resolving it crashes the runtime.
        const region = yield* yield* Region;
        for (const service of endpointServices) {
            gatewayEndpoints.push(yield* VpcEndpoint(`${toEndpointId(service)}Endpoint`, {
                vpcId: vpc.vpcId,
                serviceName: `com.amazonaws.${region}.${service}`,
                vpcEndpointType: "Gateway",
                routeTableIds: privateRouteTables.map((table) => table.routeTableId),
                tags,
            }));
        }
    }
    return {
        availabilityZones,
        vpc,
        internetGateway,
        elasticIps,
        natGateways,
        publicSubnets,
        privateSubnets,
        publicRouteTables: [publicRouteTable],
        privateRouteTables,
        publicRoutes: [publicInternetRoute],
        privateRoutes,
        publicRouteAssociations,
        privateRouteAssociations,
        gatewayEndpoints,
        vpcId: vpc.vpcId,
        // A "public subnet" is usable for public IPv4 only after both its
        // route-table association and the route through the internet gateway
        // exist. Preserve those dependencies in the convenience IDs returned
        // to downstream resources. Besides preventing a launch/readiness race,
        // this makes teardown order those consumers before the route and IGW;
        // EC2 refuses to detach an IGW while an instance in the VPC still owns
        // a public IPv4 address.
        publicSubnetIds: publicSubnets.map((subnet, index) => Output.all(subnet.subnetId, publicRouteAssociations[index].associationId, publicInternetRoute.routeTableId).pipe(Output.map(([subnetId]) => subnetId))),
        privateSubnetIds: privateSubnets.map((subnet) => subnet.subnetId),
    };
}).pipe(Effect.orDie));
const resolveAvailabilityZones = (input) => Effect.gen(function* () {
    if (Array.isArray(input)) {
        if (input.length === 0) {
            return yield* Effect.fail(new Error("EC2.Network requires at least one availability zone"));
        }
        if (new Set(input).size !== input.length) {
            return yield* Effect.fail(new Error("EC2.Network availabilityZones must not contain duplicates"));
        }
        return input;
    }
    const desiredCount = input ?? 2;
    if (!Number.isInteger(desiredCount) || desiredCount <= 0) {
        return yield* Effect.fail(new Error("EC2.Network availabilityZones count must be a positive integer"));
    }
    if (globalThis.__ALCHEMY_RUNTIME__) {
        // Inside a deployed Function this composition is re-executed at init,
        // where every `yield* Subnet(...)` resolves its attributes from the
        // injected environment — the zone names below only shape input props
        // that the runtime ignores. Skip ec2:DescribeAvailabilityZones
        // entirely: the function role does not (and should not) have that
        // permission, so calling it at init crashes with UnauthorizedOperation.
        const region = yield* yield* Region;
        return Array.from({ length: desiredCount }, (_, index) => `${region}${String.fromCharCode(97 + index)}`);
    }
    const result = yield* ec2.describeAvailabilityZones({});
    const zones = (result.AvailabilityZones ?? [])
        .filter((zone) => zone.State === "available" && zone.ZoneName)
        .map((zone) => zone.ZoneName)
        .sort((a, b) => a.localeCompare(b));
    if (zones.length < desiredCount) {
        return yield* Effect.fail(new Error(`EC2.Network requested ${desiredCount} availability zones, but only ${zones.length} are available`));
    }
    return zones.slice(0, desiredCount);
});
const deriveSubnetCidrs = (cidrBlock, azCount) => {
    const [baseAddress, prefixText] = cidrBlock.split("/");
    const prefix = Number(prefixText);
    if (!baseAddress || !Number.isInteger(prefix) || prefix < 0 || prefix > 28) {
        throw new Error(`EC2.Network requires a valid IPv4 CIDR block, got '${cidrBlock}'`);
    }
    const totalSubnets = azCount * 2;
    const additionalBits = Math.ceil(Math.log2(totalSubnets));
    const subnetPrefix = Math.max(prefix + additionalBits, 24);
    if (subnetPrefix > 28) {
        throw new Error(`EC2.Network CIDR block '${cidrBlock}' is too small for ${totalSubnets} subnets`);
    }
    const subnetSize = 2 ** (32 - subnetPrefix);
    const base = toNetworkAddress(baseAddress, prefix);
    return {
        public: Array.from({ length: azCount }, (_, index) => toCidr(base + subnetSize * index, subnetPrefix)),
        private: Array.from({ length: azCount }, (_, index) => toCidr(base + subnetSize * (index + azCount), subnetPrefix)),
    };
};
const toNetworkAddress = (ip, prefix) => {
    const value = ipv4ToNumber(ip);
    const blockSize = 2 ** (32 - prefix);
    return Math.floor(value / blockSize) * blockSize;
};
const ipv4ToNumber = (ip) => {
    const octets = ip.split(".").map((part) => Number(part));
    if (octets.length !== 4 ||
        octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
        throw new Error(`Invalid IPv4 address '${ip}'`);
    }
    return (octets[0] * 256 ** 3 + octets[1] * 256 ** 2 + octets[2] * 256 + octets[3]);
};
const numberToIpv4 = (value) => [
    Math.floor(value / 256 ** 3) % 256,
    Math.floor(value / 256 ** 2) % 256,
    Math.floor(value / 256) % 256,
    value % 256,
].join(".");
const toCidr = (value, prefix) => `${numberToIpv4(value)}/${prefix}`;
const uniqueGatewayEndpoints = (services = []) => [
    ...new Set(services),
];
const toEndpointId = (service) => service === "s3" ? "S3" : "DynamoDb";
//# sourceMappingURL=Network.js.map