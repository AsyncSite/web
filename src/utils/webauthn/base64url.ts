export function toBase64Url(bytes: ArrayBuffer): string {
  const bin = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function fromBase64Url(base64url: string): ArrayBuffer {
  const pad = '='.repeat((4 - (base64url.length % 4)) % 4);
  const base64 = (base64url + pad).replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}
