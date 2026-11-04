import { headers } from "next/headers";

export async function getRequestIp(): Promise<string> {
  const headerStore = await headers();

  // 1. Prioritas Cloudflare Edge (Paling aman, tidak bisa dipalsukan penyerang)
  const cfConnectingIp = headerStore.get("cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  // 2. Header Real IP dari Reverse Proxy standar
  const realIp = headerStore.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  // 3. Fallback header Forwarded-For
  const forwardedFor = headerStore.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return "unknown";
}
