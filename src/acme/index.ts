import { request } from "undici"
import { createPrivateRsaKey, AccountKeys } from '../crypto/createPrivateRsaKey'
import { DIRECTORIES } from "../directories"
import getAuthorizations from './getAuthorizations'
import { getChallengeKey } from './getChallengeKey'
import newAccount from './newAccount'
import newOrder from './newOrder'

interface AcmeRequest {
  keyChange: string,
  meta: {
    caaIdentities: string[],
    termsOfService: string,
    website: string,
    externalAccountRequired: boolean,
  },
  newAccount: string,
  newAuthz: string,
  newNonce: string,
  newOrder: string,
  renewalInfo: string,
  revokeCert: string,
}

async function createAcme(directory: DIRECTORIES) {
  const { body } = await request(directory)
  const acmeLinks = await body.json() as AcmeRequest
  return acmeLinks
}

async function newNonce(newNonceLink: AcmeRequest['newNonce']) {
  const { headers } = await request(newNonceLink)
  const nonce = headers['replay-nonce'] as string
  return nonce
}

async function Acme(directory: DIRECTORIES) {

  const acmeLinks = await createAcme(directory)
  const account = await newAccount({
    url: acmeLinks.newAccount,
    nonce: await newNonce(acmeLinks.newNonce)
  }, {
    contact: ['mailto:admin@markssl.com'],
    termsOfServiceAgreed: true
  })

  const order = await newOrder({
    url: acmeLinks.newOrder,
    nonce: await newNonce(acmeLinks.newNonce)
  }, account, {
    identifiers: [
      {
        type: 'dns',
        value: 'markssl.com'
      }
    ]
  })

  for await (const authorization of order.authorizations) {
    const { challenges } = await getAuthorizations({ url: authorization, nonce: await newNonce(acmeLinks.newNonce) }, account)
    for await (const challenge of challenges) {
      console.log(getChallengeKey(challenge, account))
    }
  }
}

Acme(DIRECTORIES.LETSENCRYPT_STAGING)
