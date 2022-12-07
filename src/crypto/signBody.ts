import { constants, createSign } from 'node:crypto'
import { AccountKeys } from './createPrivateRsaKey'
import { PayloadType } from './types'

interface AbstractSignPayload {
  url: string
  nonce: string
  payload: PayloadType
}

export interface SignPayloadJWK extends AbstractSignPayload {
  jwk: JsonWebKey
}

export interface SignPayloadKID extends AbstractSignPayload {
  kid: string
}

type SignPayload = SignPayloadJWK | SignPayloadKID

interface SignerBody {
  payload: string
  protected: string
}

interface SignedBody extends SignerBody {
  signature: string,
}

interface HeaderType {
  alg: string
  url: string
  nonce: string
  jwk?: JsonWebKey
  kid?: string
}

export function signBody(privateKey: AccountKeys['privateKey'], data: SignPayload): SignedBody {
  const header: HeaderType = {
    alg: 'RS256',
    url: data.url,
    nonce: data.nonce,
  }
  
  if('jwk' in data) {
    header['jwk'] = data.jwk
  }

  if('kid' in data) {
    header['kid'] = data.kid
  }
  
  const result = {
    payload: data.payload ? Buffer.from(JSON.stringify(data.payload)).toString('base64url') : '',
    protected: Buffer.from(JSON.stringify(header)).toString('base64url')
  }

  const signature = createSign('SHA256')
    .update(`${result.protected}.${result.payload}`, 'utf8')
    /* Signature - https://stackoverflow.com/questions/39554165 */
    .sign({
      key: privateKey,
      padding: constants.RSA_PKCS1_PADDING,
      dsaEncoding: 'ieee-p1363'
    }, 'base64url')

  return {
    protected: result.protected,
    payload: result.payload,
    signature,
  }
}