import { request } from 'undici'
import { AccountKeys } from '../crypto/createPrivateRsaKey'
import { signBody } from '../crypto/signBody'
import { DIRECTORIES } from '../directories'
import { RequestType } from '../types'
import getAuthorizations from './getAuthorizations'
import { newAccountResponse } from './newAccount'

export interface Identifier {
  type: 'dns'
  value: string
}

export interface createOrderPayload {
  identifiers: Identifier[]
  notBefore?: string
  notAfter?: string
}

export type StatusType = 'pending' | 'ready' | 'processing' | 'valid' | 'invalid'
export interface newOrderResponse {
  status: StatusType
  expires: string
  identifiers: Identifier[]
  authorizations: string[]
  finalize: string
}

export default async function newOrder(data: RequestType, account: newAccountResponse, payload: createOrderPayload): Promise<newOrderResponse> {
  const signedBody = signBody(account.privateKey, {
    url: data.url,
    nonce: data.nonce,
    kid: account.location,
    payload
  })

  const { body } = await request(data.url, {
    method: 'POST',
    body: JSON.stringify(signedBody),
    headers: {
      'Content-Type': 'application/jose+json',
    }
  })
  return await body.json()
}