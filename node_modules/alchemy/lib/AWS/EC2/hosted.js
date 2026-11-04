import * as iam from "@distilled.cloud/aws/iam";
import * as s3 from "@distilled.cloud/aws/s3";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Bundle from "../../Bundle/Bundle.js";
import { findCwdForBundle, resolveMainPath } from "../../Bundle/TempRoot.js";
import { createPhysicalName } from "../../PhysicalName.js";
import { createHostRuntimeContext, } from "../../Server/Process.js";
import { createInternalTags, createTagsList, hasTags } from "../../Tags.js";
import { sha256 } from "../../Util/sha256.js";
import { zipCode } from "../../Util/zip.js";
import { Assets } from "../Assets.js";
import { AWSEnvironment } from "../Environment.js";
export const createEc2HostRuntimeContext = createHostRuntimeContext;
export const createEc2HostedSupport = ({ stackName, stage, virtualEntryPlugin, resourceType, }) => {
    const alchemyEnv = {
        ALCHEMY_STACK_NAME: stackName,
        ALCHEMY_STAGE: stage,
        ALCHEMY_PHASE: "runtime",
    };
    const createRoleName = (id) => createPhysicalName({
        id: `${id}-role`,
        maxLength: 64,
    });
    const createPolicyName = (id) => createPhysicalName({
        id: `${id}-policy`,
        maxLength: 128,
    });
    const createManagedProfileName = (id) => createPhysicalName({
        id: `${id}-profile`,
        maxLength: 128,
    });
    const createRuntimeUnitName = (id) => createPhysicalName({
        id: `${id}-instance`,
        maxLength: 64,
        lowercase: true,
    }).pipe(Effect.map((name) => name.replaceAll(/[^a-z0-9-]/g, "-")));
    const normalizeSecurityGroups = (groups) => [...(groups ?? [])].sort((a, b) => a.localeCompare(b));
    const bundleProgram = Effect.fn(function* (id, props) {
        if (!props.main) {
            return yield* Effect.fail(new Error(`${resourceType} '${id}' requires 'main' when bundling a hosted process`));
        }
        const handler = props.handler ?? "default";
        const realMain = yield* resolveMainPath(props.main);
        const cwd = yield* findCwdForBundle(realMain);
        const buildBundle = Effect.fn(function* (entry, plugins) {
            return yield* Bundle.build({
                ...props.build?.input,
                input: entry,
                cwd,
                platform: "node",
                // The hosted process runs under `bun` (installed by the user-data);
                // keep `bun`/`bun:*` external and resolve the `bun` export condition
                // so `@effect/platform-bun` picks its Bun implementations.
                external: [
                    "bun",
                    "bun:*",
                    ...(props.build?.input?.external ?? []),
                ],
                resolve: {
                    conditionNames: [...Bundle.BUN_CONDITION_NAMES],
                    ...props.build?.input?.resolve,
                },
                plugins: [props.build?.input?.plugins, plugins],
            }, {
                ...props.build?.output,
                format: "esm",
                sourcemap: props.build?.output?.sourcemap ?? false,
                minify: props.build?.output?.minify ?? false,
                entryFileNames: "index.mjs",
            }, props.build);
        });
        const bundleOutput = props.isExternal
            ? yield* buildBundle(realMain)
            : yield* buildBundle(realMain, virtualEntryPlugin((importPath) => `
import { bootstrap } from "alchemy/Runtime/Bootstrap/Ec2";
import { ${handler} as entrypoint } from ${JSON.stringify(importPath)};

await bootstrap(entrypoint);
`));
        // Zip every emitted file: the entry becomes `index.mjs` (what the systemd
        // unit runs) and shared chunks keep their `*.js` names so the entry's
        // relative imports resolve. Dropping a chunk crashes the process at start.
        const toBytes = (content) => typeof content === "string" ? new TextEncoder().encode(content) : content;
        const [entryFile, ...chunkFiles] = bundleOutput.files;
        const archive = yield* zipCode(toBytes(entryFile.content), chunkFiles.map((file) => ({
            path: file.path,
            content: toBytes(file.content),
        })));
        return { archive, hash: bundleOutput.hash };
    });
    const quoteEnvValue = (value) => {
        const text = typeof value === "string" ? value : JSON.stringify(value ?? null);
        return `'${text.replaceAll(/'/g, `'""'`).replaceAll(/\n/g, "\\n")}'`;
    };
    const renderEnvFile = (env) => Object.entries(env)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${quoteEnvValue(value)}`)
        .join("\n");
    const renderHostedUserData = Effect.fn(function* ({ unitName, bundleKey, envKey, region, }) {
        const appDir = `/opt/${unitName}`;
        const bucket = yield* Assets.BucketName;
        // User-data runs once via cloud-init's `scripts-user` (once-per-instance),
        // and is skipped on any subsequent boot — so it must NOT carry the work
        // that can fail transiently (bun install over the network, S3 sync). It
        // only writes the setup script + unit and enables the service. The systemd
        // service (Restart=always) runs the setup on every start, so a flaky bun
        // install / S3 read self-heals and the service survives reboots.
        return `#!/bin/bash
set -uo pipefail

mkdir -p "${appDir}"

cat >/usr/local/bin/${unitName}-setup.sh <<'SETUP_EOF'
#!/bin/bash
set -uo pipefail
export HOME=/root

# unzip (needed below) — install if missing.
command -v unzip >/dev/null 2>&1 || {
  (command -v dnf >/dev/null 2>&1 && dnf install -y unzip) \
    || (command -v yum >/dev/null 2>&1 && yum install -y unzip) \
    || (command -v apt-get >/dev/null 2>&1 && apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y unzip) || true
}

# AWS CLI — preinstalled on Amazon Linux 2023; install v2 otherwise.
command -v aws >/dev/null 2>&1 || {
  curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-$(uname -m).zip" -o /tmp/awscliv2.zip \
    && (cd /tmp && unzip -q -o awscliv2.zip && ./aws/install) || true
}

# bun — retry the network install a few times.
if [ ! -x /root/.bun/bin/bun ]; then
  for attempt in 1 2 3 4 5; do
    curl -fsSL https://bun.sh/install | bash && break
    sleep 5
  done
fi

# Sync the bundle + env from S3 (must succeed for the service to start).
set -e
mkdir -p "${appDir}"
aws s3 cp "s3://${bucket}/${bundleKey}" "${appDir}/bundle.zip" --region "${region}"
aws s3 cp "s3://${bucket}/${envKey}" "${appDir}/env" --region "${region}"
rm -f "${appDir}/index.mjs"
unzip -o "${appDir}/bundle.zip" -d "${appDir}"
SETUP_EOF
chmod +x /usr/local/bin/${unitName}-setup.sh

cat >/etc/systemd/system/${unitName}.service <<'UNIT_EOF'
[Unit]
Description=Alchemy EC2 instance runtime ${unitName}
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=${appDir}
ExecStartPre=/usr/local/bin/${unitName}-setup.sh
EnvironmentFile=-${appDir}/env
# --no-install: the uploaded bundle is self-contained; bun must never fall
# into its auto-install path (which hangs startup on network package
# resolution) — fail fast if the bundle is incomplete instead.
ExecStart=/root/.bun/bin/bun --no-install ${appDir}/index.mjs
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
UNIT_EOF

systemctl daemon-reload
systemctl enable --now ${unitName}.service
`;
    });
    const mergeUserData = (hosted, userData) => {
        if (!userData) {
            return hosted;
        }
        return `${hosted}\n\n# User supplied bootstrap\n${userData.replace(/^#!\/bin\/bash\s*/, "")}`;
    };
    const listAttachedPolicyArns = (roleName) => iam
        .listAttachedRolePolicies({
        RoleName: roleName,
    })
        .pipe(Effect.map((result) => (result.AttachedPolicies ?? [])
        .map((policy) => policy.PolicyArn)
        .filter((policyArn) => Boolean(policyArn))));
    const attachManagedPolicies = Effect.fn(function* ({ roleName, managedPolicyArns, }) {
        const attached = new Set(yield* listAttachedPolicyArns(roleName));
        for (const policyArn of managedPolicyArns) {
            if (!attached.has(policyArn)) {
                yield* iam.attachRolePolicy({
                    RoleName: roleName,
                    PolicyArn: policyArn,
                });
            }
        }
    });
    const ensureManagedRole = Effect.fn(function* ({ id, roleName, managedPolicyArns, }) {
        const { accountId } = yield* AWSEnvironment.current;
        const tags = yield* createInternalTags(id);
        const role = yield* iam
            .createRole({
            RoleName: roleName,
            AssumeRolePolicyDocument: JSON.stringify({
                Version: "2012-10-17",
                Statement: [
                    {
                        Effect: "Allow",
                        Principal: {
                            Service: "ec2.amazonaws.com",
                        },
                        Action: "sts:AssumeRole",
                    },
                ],
            }),
            Tags: createTagsList(tags),
        })
            .pipe(Effect.catchTag("EntityAlreadyExistsException", () => iam.getRole({ RoleName: roleName }).pipe(Effect.filterOrFail((existing) => hasTags(tags, existing.Role?.Tags), () => new Error(`Role '${roleName}' already exists and is not managed by alchemy`)))));
        yield* attachManagedPolicies({
            roleName,
            managedPolicyArns,
        });
        return role.Role?.Arn ?? `arn:aws:iam::${accountId}:role/${roleName}`;
    });
    const ensureManagedInstanceProfile = Effect.fn(function* ({ id, profileName, roleName, }) {
        const tags = yield* createInternalTags(id);
        yield* iam
            .createInstanceProfile({
            InstanceProfileName: profileName,
            Tags: createTagsList(tags),
        })
            .pipe(Effect.catchTag("EntityAlreadyExistsException", () => Effect.void));
        const profile = yield* iam.getInstanceProfile({
            InstanceProfileName: profileName,
        });
        const currentRoleName = profile.InstanceProfile.Roles?.[0]?.RoleName;
        if (currentRoleName && currentRoleName !== roleName) {
            yield* iam
                .removeRoleFromInstanceProfile({
                InstanceProfileName: profileName,
                RoleName: currentRoleName,
            })
                .pipe(Effect.catchTag("NoSuchEntityException", () => Effect.void));
        }
        if (currentRoleName !== roleName) {
            yield* iam.addRoleToInstanceProfile({
                InstanceProfileName: profileName,
                RoleName: roleName,
            });
        }
        const refreshed = yield* iam.getInstanceProfile({
            InstanceProfileName: profileName,
        });
        return {
            instanceProfileName: refreshed.InstanceProfile.InstanceProfileName,
            instanceProfileArn: refreshed.InstanceProfile.Arn,
        };
    });
    const attachHostedBindings = Effect.fn(function* ({ roleName, policyName, assetPrefix, bindings, }) {
        const activeBindings = bindings.filter((binding) => binding.action !== "delete");
        const env = activeBindings
            .map((binding) => binding?.data?.env)
            .reduce((acc, value) => ({ ...acc, ...value }), {});
        const policyStatements = activeBindings.flatMap((binding) => binding?.data?.policyStatements?.map((statement) => ({
            ...statement,
            Sid: statement.Sid?.replace(/[^A-Za-z0-9]+/gi, ""),
        })) ?? []);
        policyStatements.push({
            Sid: undefined,
            Effect: "Allow",
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${yield* Assets.BucketName}/${assetPrefix}/*`],
        });
        yield* iam.putRolePolicy({
            RoleName: roleName,
            PolicyName: policyName,
            PolicyDocument: JSON.stringify({
                Version: "2012-10-17",
                Statement: policyStatements,
            }),
        });
        return env;
    });
    const uploadHostedArtifacts = Effect.fn(function* ({ bundleKey, envKey, archive, env, }) {
        const assets = yield* Assets;
        const contentHash = yield* sha256(archive);
        const uploadedAssetKey = yield* assets.uploadAsset(contentHash, archive);
        yield* s3.copyObject({
            Bucket: yield* assets.bucketName,
            Key: bundleKey,
            CopySource: `${yield* assets.bucketName}/${uploadedAssetKey}`,
        });
        yield* s3.putObject({
            Bucket: yield* assets.bucketName,
            Key: envKey,
            Body: renderEnvFile(env),
            ContentType: "text/plain; charset=utf-8",
        });
    });
    const resolveHostedRuntime = Effect.fn(function* ({ id, news, bindings, output, }) {
        if (!news.main) {
            return {
                userData: news.userData,
                roleName: output?.roleName,
                roleArn: output?.roleArn,
                policyName: output?.policyName,
                instanceProfileName: news.instanceProfileName ?? output?.instanceProfileName,
                instanceProfileArn: output?.instanceProfileArn,
                managedIam: output?.managedIam ?? false,
                runtimeUnitName: output?.runtimeUnitName,
                assetPrefix: output?.assetPrefix,
                code: output?.code,
            };
        }
        if (news.instanceProfileName &&
            (news.roleManagedPolicyArns?.length ?? 0) > 0) {
            return yield* Effect.fail(new Error(`${resourceType} does not support roleManagedPolicyArns with a custom instanceProfileName in host mode`));
        }
        const { region } = yield* AWSEnvironment.current;
        const runtimeUnitName = output?.runtimeUnitName ?? (yield* createRuntimeUnitName(id));
        const assetPrefix = output?.assetPrefix ?? `ec2/${runtimeUnitName}`;
        const bundleKey = `${assetPrefix}/bundle.zip`;
        const envKey = `${assetPrefix}/env`;
        const policyName = output?.policyName ?? (yield* createPolicyName(id));
        const managedIam = !news.instanceProfileName;
        let roleName;
        let roleArn;
        let instanceProfileName;
        let instanceProfileArn;
        if (managedIam) {
            roleName = output?.roleName ?? (yield* createRoleName(id));
            roleArn =
                output?.roleArn ??
                    (yield* ensureManagedRole({
                        id,
                        roleName,
                        managedPolicyArns: news.roleManagedPolicyArns ?? [],
                    }));
            const profileName = output?.instanceProfileName ?? (yield* createManagedProfileName(id));
            const profile = yield* ensureManagedInstanceProfile({
                id,
                profileName,
                roleName,
            });
            instanceProfileName = profile.instanceProfileName;
            instanceProfileArn = profile.instanceProfileArn;
        }
        else {
            const profile = yield* iam.getInstanceProfile({
                InstanceProfileName: news.instanceProfileName,
            });
            const role = profile.InstanceProfile.Roles?.[0];
            if (!role?.RoleName) {
                return yield* Effect.fail(new Error(`Instance profile '${news.instanceProfileName}' must have a role attached for host mode`));
            }
            roleName = role.RoleName;
            roleArn = role.Arn;
            instanceProfileName = profile.InstanceProfile.InstanceProfileName;
            instanceProfileArn = profile.InstanceProfile.Arn;
        }
        const bindingEnv = yield* attachHostedBindings({
            roleName,
            policyName,
            assetPrefix,
            bindings,
        });
        const env = {
            ...bindingEnv,
            ...alchemyEnv,
            // Lambda injects AWS_REGION natively; an EC2 systemd service does not
            // get one, and the runtime's `Region.fromEnv()` (and any composition
            // code that reads the region, e.g. EC2.Network's runtime AZ branch)
            // dies without it.
            AWS_REGION: region,
            ...(news.port !== undefined ? { PORT: news.port } : {}),
            ...news.env,
        };
        const { archive, hash } = yield* bundleProgram(id, news);
        yield* uploadHostedArtifacts({
            bundleKey,
            envKey,
            archive,
            env,
        });
        const hostedUserData = yield* renderHostedUserData({
            unitName: runtimeUnitName,
            bundleKey,
            envKey,
            region,
        });
        return {
            userData: mergeUserData(hostedUserData, news.userData),
            roleName,
            roleArn,
            policyName,
            instanceProfileName,
            instanceProfileArn,
            managedIam,
            runtimeUnitName,
            assetPrefix,
            code: {
                hash,
            },
        };
    });
    const cleanupHostedRuntime = Effect.fn(function* ({ output, session, }) {
        if (output.roleName && output.policyName) {
            yield* iam
                .deleteRolePolicy({
                RoleName: output.roleName,
                PolicyName: output.policyName,
            })
                .pipe(Effect.catchTag("NoSuchEntityException", () => Effect.void));
        }
        if (output.managedIam && output.instanceProfileName && output.roleName) {
            const attachedPolicyArns = yield* listAttachedPolicyArns(output.roleName).pipe(Effect.catch(() => Effect.succeed([])));
            yield* iam
                .removeRoleFromInstanceProfile({
                InstanceProfileName: output.instanceProfileName,
                RoleName: output.roleName,
            })
                .pipe(Effect.catchTag("NoSuchEntityException", () => Effect.void));
            yield* iam
                .deleteInstanceProfile({
                InstanceProfileName: output.instanceProfileName,
            })
                .pipe(Effect.catchTag("NoSuchEntityException", () => Effect.void));
            for (const policyArn of attachedPolicyArns) {
                yield* iam
                    .detachRolePolicy({
                    RoleName: output.roleName,
                    PolicyArn: policyArn,
                })
                    .pipe(Effect.catchTag("NoSuchEntityException", () => Effect.void));
            }
            yield* iam
                .deleteRole({
                RoleName: output.roleName,
            })
                .pipe(Effect.catchTag("NoSuchEntityException", () => Effect.void));
        }
        if (output.assetPrefix) {
            for (const key of [
                `${output.assetPrefix}/bundle.zip`,
                `${output.assetPrefix}/env`,
            ]) {
                yield* s3
                    .deleteObject({
                    Bucket: yield* Assets.BucketName,
                    Key: key,
                })
                    .pipe(Effect.catchTag("NoSuchKey", () => Effect.void));
            }
        }
        if (session) {
            yield* session.note(`Cleaned hosted assets for ${resourceType}`);
        }
    });
    const buildEc2NetworkData = ({ subnetId, securityGroupIds, associatePublicIpAddress, privateIpAddress, }) => {
        const groups = normalizeSecurityGroups(securityGroupIds);
        const usePrimaryNetworkInterface = subnetId !== undefined ||
            associatePublicIpAddress !== undefined ||
            privateIpAddress !== undefined;
        return {
            usePrimaryNetworkInterface,
            groups,
            networkInterfaces: usePrimaryNetworkInterface
                ? [
                    {
                        DeviceIndex: 0,
                        SubnetId: subnetId,
                        Groups: groups.length > 0 ? groups : undefined,
                        AssociatePublicIpAddress: associatePublicIpAddress,
                        PrivateIpAddress: privateIpAddress,
                        DeleteOnTermination: true,
                    },
                ]
                : undefined,
        };
    };
    const buildLaunchTemplateData = (news, runtime) => {
        const encodedUserData = runtime.userData
            ? Buffer.from(runtime.userData).toString("base64")
            : undefined;
        const network = buildEc2NetworkData(news);
        const instanceTags = {
            ...news.tags,
        };
        return {
            ImageId: news.imageId,
            InstanceType: news.instanceType,
            KeyName: news.keyName,
            IamInstanceProfile: runtime.instanceProfileName
                ? {
                    Name: runtime.instanceProfileName,
                }
                : undefined,
            UserData: encodedUserData,
            Placement: news.availabilityZone
                ? {
                    AvailabilityZone: news.availabilityZone,
                }
                : undefined,
            NetworkInterfaces: network.networkInterfaces,
            SubnetId: network.usePrimaryNetworkInterface ? undefined : news.subnetId,
            SecurityGroupIds: network.usePrimaryNetworkInterface
                ? undefined
                : network.groups.length > 0
                    ? network.groups
                    : undefined,
            PrivateIpAddress: network.usePrimaryNetworkInterface
                ? undefined
                : news.privateIpAddress,
            TagSpecifications: Object.keys(instanceTags).length > 0
                ? [
                    {
                        ResourceType: "instance",
                        Tags: createTagsList(instanceTags),
                    },
                ]
                : undefined,
        };
    };
    return {
        normalizeSecurityGroups,
        buildLaunchTemplateData,
        bundleProgram,
        resolveHostedRuntime,
        cleanupHostedRuntime,
    };
};
//# sourceMappingURL=hosted.js.map