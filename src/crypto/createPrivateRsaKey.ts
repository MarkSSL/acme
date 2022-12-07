import { promisify } from 'node:util'
import { generateKeyPair } from 'node:crypto'

export interface AccountKeys {
  privateKey: string | Buffer
  jwk: JsonWebKey
}

export async function createPrivateRsaKey(modulusLength: number = 2048):  Promise<AccountKeys> {

  const pairKeys = await promisify(generateKeyPair)('rsa', {
    modulusLength,
  })

  const privateKey = pairKeys.privateKey.export({
    format: 'pem',
    type: 'pkcs8',
  })

  const jwk = pairKeys.publicKey.export({
    format: 'jwk',
  })


  return { privateKey, jwk }
}