/**
 * Hostnames that mean "this machine" in a connection string. Inside a Docker
 * container they resolve to the container itself, so alchemy rewrites them to
 * `host.docker.localhost` (Prisma's `prisma+postgres://` plain-HTTP gate
 * requires a localhost-looking host).
 *
 * Native Linux Docker cannot SYN Docker's `host-gateway` (bridge IP) without
 * hitting host INPUT / UFW. Binding extra host IPs does not skip that.
 * The workerd sidecar proxy instead unix-socket-tunnels these ports into
 * the container netns — see `DockerLoopback.ts` in cloudflare-runtime.
 */
export declare const isLoopbackHost: (hostname: string) => boolean;
//# sourceMappingURL=DockerHostGateway.d.ts.map