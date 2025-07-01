export async function generateAuthToken(password: string): Promise<string> {
  const secret = process.env.AUTH_SECRET ?? 'moontv_default_secret';

  const encoder = new TextEncoder();
  const data = encoder.encode(secret + password);

  // 计算 SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
