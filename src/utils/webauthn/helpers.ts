import { toBase64Url, fromBase64Url } from './base64url';

export type PublicKeyCredentialCreationOptionsJSON = any; // refine later
export type PublicKeyCredentialRequestOptionsJSON = any; // refine later

export async function createPasskey(options: PublicKeyCredentialCreationOptionsJSON) {
  const publicKey: PublicKeyCredentialCreationOptions = {
    ...options,
    challenge: fromBase64Url(options.challenge),
    user: {
      ...options.user,
      id: fromBase64Url(options.user.id)
    }
  } as any;
  const cred = (await navigator.credentials.create({ publicKey })) as PublicKeyCredential;
  return serializeCredential(cred);
}

export async function getPasskey(options: PublicKeyCredentialRequestOptionsJSON) {
  const publicKey: PublicKeyCredentialRequestOptions = {
    ...options,
    challenge: fromBase64Url(options.challenge),
    allowCredentials: options.allowCredentials?.map((c: any) => ({
      ...c,
      id: fromBase64Url(c.id)
    }))
  } as any;
  const assertion = (await navigator.credentials.get({ publicKey })) as PublicKeyCredential;
  return serializeCredential(assertion);
}

function serializeCredential(cred: PublicKeyCredential) {
  const response: any = cred.response as any;
  return {
    id: cred.id,
    type: cred.type,
    rawId: toBase64Url(cred.rawId),
    response: {
      clientDataJSON: response.clientDataJSON ? toBase64Url(response.clientDataJSON) : undefined,
      attestationObject: response.attestationObject ? toBase64Url(response.attestationObject) : undefined,
      authenticatorData: response.authenticatorData ? toBase64Url(response.authenticatorData) : undefined,
      signature: response.signature ? toBase64Url(response.signature) : undefined,
      userHandle: response.userHandle ? toBase64Url(response.userHandle) : undefined
    }
  };
}
