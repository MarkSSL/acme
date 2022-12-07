import { request } from 'undici'
import { AccountKeys, createPrivateRsaKey } from '../crypto/createPrivateRsaKey'
import { signBody } from '../crypto/signBody'
import { RequestType } from '../types'

export interface newAccountPayload {
  contact: string[],
  termsOfServiceAgreed: boolean,
}

export interface newAccountResponse extends AccountKeys {
  location: string,
}

export default async function newAccount(data: RequestType, payload: newAccountPayload): Promise<newAccountResponse> {
  const { privateKey, jwk } = await createPrivateRsaKey()
  const signedBody = signBody(privateKey, {
    url: data.url,
    nonce: data.nonce,
    jwk,
    payload,
  })

  const { headers } = await request(data.url, {
    method: 'POST',
    body: JSON.stringify(signedBody),
    headers: {
      'Content-Type': 'application/jose+json',
    }
  })
  const location = headers['location'] as string

  return { location, privateKey, jwk }
}
