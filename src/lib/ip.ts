/**
 * Hashes an IP address using SHA-256 so we never store raw IPs.
 * Works in the Next.js Edge/Node runtime via the Web Crypto API.
 */
export async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  // Salt with a fixed string to prevent rainbow table attacks on IPs
  const data = encoder.encode(`spendwise:${ip}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Extracts the real IP from a Next.js request,
 * handling common proxy headers (Vercel, Cloudflare, etc.)
 */
export function getClientIP(req: Request): string {
  const headers = req instanceof Request ? req.headers : new Headers();

  return (
    headers.get("x-real-ip") ??
    headers.get("cf-connecting-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}
