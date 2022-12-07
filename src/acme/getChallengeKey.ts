import { createHash } from 'node:crypto'
import { Challenge } from './getAuthorizations'
import { newAccountResponse } from './newAccount'

export function getChallengeKey(challenge: Challenge, account: newAccountResponse) {
  const keysum = createHash('sha256')
  .update(JSON.stringify(account.jwk))

  const tumbprint = keysum.digest('base64url')
  const result = `${challenge.token}.${tumbprint}`


  /**
  * https://tools.ietf.org/html/rfc8555#section-8.3
  */
  if (challenge.type === 'http-01') {
    return result;
  }

  /**
  * https://tools.ietf.org/html/rfc8555#section-8.4
  * https://datatracker.ietf.org/doc/html/draft-ietf-acme-tls-alpn-01
  */
  if(['dns-01', 'tls-alpn-01'].includes(challenge.type)) {
    const shasum = createHash('sha256').update(result);
    return shasum.digest('base64url');
  }

  throw new Error(`Unable to produce key authorization, unknown challenge type: ${challenge.type}`);
}