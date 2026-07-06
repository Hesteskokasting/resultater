function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(byte => byte.toString(16).padStart(2, '0')).join('')
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return toHex(new Uint8Array(digest))
}

// rawNonce goes to Supabase, nonceDigest (its SHA-256 hash) goes to the identity
// provider — the provider embeds the digest in the ID token, and Supabase hashes
// rawNonce itself to verify the token was issued for this exact sign-in attempt.
export async function generateNonce(): Promise<{ rawNonce: string; nonceDigest: string }> {
  const rawNonce = toHex(crypto.getRandomValues(new Uint8Array(16)))
  const nonceDigest = await sha256Hex(rawNonce)
  return { rawNonce, nonceDigest }
}
