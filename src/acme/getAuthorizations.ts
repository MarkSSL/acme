import { request } from 'undici'
import { signBody } from '../crypto/signBody'
import { RequestType } from '../types'
import { newAccountResponse } from './newAccount'
import { Identifier, StatusType } from './newOrder'

type ChallengeType = 'http-01' | 'dns-01'

export interface Challenge {
  type: ChallengeType
  status: StatusType
  url: string
  token: string
}

export interface newAuthorizationResponse {
  identifier: Identifier
  status: StatusType
  expires: string
  challenges: Challenge[]
}

export default async function getAuthorizations(data: RequestType, account: newAccountResponse): Promise<newAuthorizationResponse> {
  const signedBody = signBody(account.privateKey, {
    url: data.url,
    nonce: data.nonce,
    kid: account.location,
    payload: null
  })

  const { statusCode, body, headers } = await request(data.url, {
    method: 'POST',
    body: JSON.stringify(signedBody),
    headers: {
      'Content-Type': 'application/jose+json',
    }
  })
  return await body.json()
}